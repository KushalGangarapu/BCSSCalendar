import { parseISO, differenceInMinutes } from 'date-fns';

/**
 * Checks if an event is "Live" (happening now).
 * Strictly: If the current time is between the start time and 60 minutes after the start time.
 */
export const isEventLive = (eventDateISO: string): boolean => {
    const eventTime = parseISO(eventDateISO);
    const now = new Date();
    const diff = differenceInMinutes(now, eventTime);

    // We consider an event "Live" if it started less than 60 minutes ago
    // but isn't in the future.
    return diff >= 0 && diff < 60;
};
