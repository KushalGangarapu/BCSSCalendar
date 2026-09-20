import { parseISO, differenceInMinutes, format, isSameDay } from 'date-fns';

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
    const start = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(start.getTime())) return false;
    
    const isStartMidnight = start.getHours() === 0 && start.getMinutes() === 0;
    if (!isStartMidnight) return false;

    if (!endDate) return true;

    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
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
    const start = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(start.getTime())) return '';

    const allDayLabel = isNoSchoolEvent(tags) ? 'No School' : 'All Day';

    if (isAllDayEvent(start, endDate)) {
        if (endDate) {
            const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
            if (!isNaN(end.getTime()) && !isSameDay(start, end)) {
                return `${allDayLabel} (${format(start, 'MMM d')} – ${format(end, 'MMM d')})`;
            }
        }
        return allDayLabel;
    }

    const startStr = format(start, 'h:mm a');
    if (!endDate) return startStr;

    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
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

    // All-day events with no explicit end are live for the entire day
    if (isAllDayEvent(eventTime, null)) {
        return isSameDay(now, eventTime);
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
        const dayStr = format(day, 'yyyy-MM-dd');
        const start = parseISO(event.date);
        const startStr = format(start, 'yyyy-MM-dd');

        // Always show on start date
        if (startStr === dayStr) return true;

        if (event.endDate) {
            const end = parseISO(event.endDate);
            const endStr = format(end, 'yyyy-MM-dd');

            if (startStr !== endStr) {
                // Always show on end date
                if (endStr === dayStr) return true;

                // Show on today if currently ongoing between start and end
                const todayStr = format(new Date(), 'yyyy-MM-dd');
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

