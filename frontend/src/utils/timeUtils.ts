import { parseISO, differenceInMinutes, format, isSameDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Burnaby Central's wall clock. BC adopted permanent UTC-7 ("Pacific Time",
// PCT) on Mar 8, 2026 — its final clock change — so we pin a FIXED offset zone
// rather than 'America/Vancouver': runtimes with stale tzdata still apply
// Vancouver's old DST rules and would be an hour off for Nov 2026–Mar 2027.
// ('Etc/GMT+7' is POSIX-style: the sign is inverted, so +7 means UTC-7.)
export const SCHOOL_TZ = 'Etc/GMT+7';

/** Returns a Date whose local getters read the school-local wall clock for `date`. */
export const toSchoolTime = (date: string | Date): Date =>
    toZonedTime(typeof date === 'string' ? parseISO(date) : date, SCHOOL_TZ);

/** Parses a 'yyyy-MM-ddTHH:mm:ss' wall-clock string as school-local time → real instant. */
export const fromSchoolTime = (wallClock: string): Date =>
    fromZonedTime(wallClock, SCHOOL_TZ);

/** True when the browser can't map the OS timezone to an IANA zone — dates may render wrong. */
export const isUnrecognizedTimeZone = (): boolean => {
    try {
        return !Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return true;
    }
};

/** 'yyyy-MM-dd' day key in school time — used for bucketing events onto calendar cells. */
export const schoolDayKey = (date: string | Date): string =>
    format(toSchoolTime(date), 'yyyy-MM-dd');

/** End of the school-local calendar day (23:59:59.999) containing `date`, as a real instant. */
export const endOfSchoolDay = (date: string | Date): Date =>
    fromSchoolTime(`${schoolDayKey(date)}T23:59:59.999`);

// Reserved marker tags auto-managed by the event forms to distinguish holiday types.
// These are event tags, not categories — they never appear in filter lists.
export const OBSERVANCE_TAG = 'Observed Day';
export const NO_SCHOOL_TAG = 'No School';
// 'Holiday' is the legacy marker written by older versions — kept in the strip list
// so it gets replaced with 'Observed Day' the next time the event is saved.
export const MARKER_TAGS = [OBSERVANCE_TAG, NO_SCHOOL_TAG, 'Holiday'];

/**
 * Resolves the display color for a tag pill. Marker tags get distinct colors
 * (No School = red, Observed Day = lime green); everything else falls back to
 * the matching category color, then `fallback`.
 */
export const getTagPillColor = (tag: string, categories: { name: string; color: string }[] = [], fallback: string = 'var(--bcss-red)'): string => {
    const t = tag.trim().toLowerCase();
    if (t === 'no school') return '#D90429';
    if (t === 'observed day' || t === 'holiday') return '#65a30d';
    return categories.find(c => c.name.trim().toLowerCase() === t)?.color || fallback;
};

/**
 * Checks if an event is a school closure (marked with the "No School" tag).
 */
export const isNoSchoolEvent = (tags?: string[] | null): boolean =>
    !!tags?.some(t => t.trim().toLowerCase() === 'no school');

/**
 * Checks if an event is an all-day event (start time is midnight and no specific timed end).
 */
export const isAllDayEvent = (date: string | Date, endDate?: string | Date | null): boolean => {
    const start = toSchoolTime(date);
    if (isNaN(start.getTime())) return false;

    const isStartMidnight = start.getHours() === 0 && start.getMinutes() === 0;
    if (!isStartMidnight) return false;

    if (!endDate) return true;

    const end = toSchoolTime(endDate);
    if (isNaN(end.getTime())) return true;

    const isEndMidnight = end.getHours() === 0 && end.getMinutes() === 0;
    const isEndOfDay = end.getHours() === 23 && end.getMinutes() === 59;

    return isEndMidnight || isEndOfDay;
};

/**
 * Formats event time cleanly for calendar lists and cards:
 * - "No School" or "No School (Sep 21 – Sep 23)" for school closures
 * - "All Day" or "All Day (Sep 21 – Sep 23)" for all-day events
 * - "3:00 PM" or "3:00 PM – 4:00 PM" for timed events
 */
export const formatEventTime = (date: string | Date, endDate?: string | Date | null, tags?: string[] | null): string => {
    const start = toSchoolTime(date);
    if (isNaN(start.getTime())) return '';

    const allDayLabel = isNoSchoolEvent(tags) ? 'No School' : 'All Day';

    if (isAllDayEvent(date, endDate)) {
        if (endDate) {
            const end = toSchoolTime(endDate);
            if (!isNaN(end.getTime()) && !isSameDay(start, end)) {
                return `${allDayLabel} (${format(start, 'MMM d')} – ${format(end, 'MMM d')})`;
            }
        }
        return allDayLabel;
    }

    const startStr = format(start, 'h:mm a');
    if (!endDate) return startStr;

    const end = toSchoolTime(endDate);
    if (isNaN(end.getTime())) return startStr;

    if (isSameDay(start, end)) {
        return `${startStr} – ${format(end, 'h:mm a')}`;
    } else {
        return `${startStr} – ${format(end, 'MMM d, h:mm a')}`;
    }
};

/**
 * Checks if an event is "Live" (happening now).
 * If endDateISO is provided, the event is live between start and end.
 * Otherwise, it's live for 60 minutes after the start time.
 */
export const isEventLive = (eventDateISO: string, endDateISO?: string | null): boolean => {
    const eventTime = parseISO(eventDateISO);
    const now = new Date();

    if (endDateISO) {
        const endTime = parseISO(endDateISO);
        return now >= eventTime && now <= endTime;
    }

    // All-day events with no explicit end are live for the entire school day
    if (isAllDayEvent(eventTime, null)) {
        return schoolDayKey(now) === schoolDayKey(eventTime);
    }

    // Fallback: live for 60 minutes after start
    const diff = differenceInMinutes(now, eventTime);
    return diff >= 0 && diff < 60;
};

/**
 * Checks if an event should appear on a given calendar day.
 * - Single-day events: show on their start date.
 * - Multi-day events: show on start date, end date, AND today (if currently ongoing).
 */
export const isEventOnDay = (event: { date: string; endDate?: string | null }, day: Date): boolean => {
    try {
        // `day` is a calendar grid cell — its label is local; event instants are
        // bucketed by their school-local date so they land on the right cell
        // regardless of the viewer's timezone.
        const dayStr = format(day, 'yyyy-MM-dd');
        const startStr = schoolDayKey(event.date);

        // Always show on start date
        if (startStr === dayStr) return true;

        if (event.endDate) {
            const endStr = schoolDayKey(event.endDate);

            if (startStr !== endStr) {
                // Always show on end date
                if (endStr === dayStr) return true;

                // Show on today if currently ongoing between start and end
                const todayStr = schoolDayKey(new Date());
                if (dayStr === todayStr && dayStr > startStr && dayStr < endStr) {
                    return true;
                }

                // Hide on non-today middle days
                return false;
            }
        }
        return false;
    } catch {
        return false;
    }
};

