import { parseISO, differenceInMinutes, format, isSameDay } from 'date-fns';

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
 * - "All Day" or "All Day (Sep 21 – Sep 23)" for all-day events
 * - "3:00 PM" or "3:00 PM – 4:00 PM" for timed events
 */
export const formatEventTime = (date: string | Date, endDate?: string | Date | null): string => {
    const start = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(start.getTime())) return '';

    if (isAllDayEvent(start, endDate)) {
        if (endDate) {
            const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
            if (!isNaN(end.getTime()) && !isSameDay(start, end)) {
                return `All Day (${format(start, 'MMM d')} – ${format(end, 'MMM d')})`;
            }
        }
        return 'All Day';
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

