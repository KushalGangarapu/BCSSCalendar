import { parseISO, differenceInMinutes, isSameDay, startOfDay } from 'date-fns';

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
 * - Multi-day events: show on start date AND on today (if ongoing).
 */
export const isEventOnDay = (event: { date: string; endDate?: string | null }, day: Date): boolean => {
    const start = parseISO(event.date);
    if (event.endDate && !isSameDay(start, parseISO(event.endDate))) {
        // Multi-day event: show on start date + today if ongoing
        if (isSameDay(start, day)) return true;
        const end = parseISO(event.endDate);
        const today = new Date();
        if (!isSameDay(day, today)) return false;
        const dayStart = startOfDay(day);
        return dayStart >= startOfDay(start) && dayStart <= startOfDay(end);
    }
    return isSameDay(start, day);
};
