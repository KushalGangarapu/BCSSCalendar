import { parseISO, differenceInMinutes, format } from 'date-fns';

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

