export interface BaseEvent {
    id: string;
    title: string;
    date: string | Date;
    endDate?: string | Date | null;
    clubId?: string | null;
    recurring?: string | null;
    [key: string]: any;
}

/**
 * Filters a list of events such that for any recurring series:
 * - Past occurrences are preserved for calendar history browsing.
 * - Only the SINGLE next upcoming occurrence is shown in the future.
 * - Once that date passes, the next upcoming occurrence automatically takes its place.
 */
export function filterRecurringEvents<T extends BaseEvent>(events: T[]): T[] {
    if (!Array.isArray(events)) return [];

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const seenRecurringSeries = new Set<string>();

    const sorted = [...events].sort((a, b) => {
        const timeA = typeof a.date === 'string' ? new Date(a.date).getTime() : (a.date instanceof Date ? a.date.getTime() : 0);
        const timeB = typeof b.date === 'string' ? new Date(b.date).getTime() : (b.date instanceof Date ? b.date.getTime() : 0);
        return timeA - timeB;
    });

    return sorted.filter(ev => {
        if (!ev.recurring) {
            return true;
        }

        const evStart = typeof ev.date === 'string' ? new Date(ev.date) : (ev.date instanceof Date ? ev.date : new Date());
        const evEnd = ev.endDate ? (typeof ev.endDate === 'string' ? new Date(ev.endDate) : (ev.endDate instanceof Date ? ev.endDate : evStart)) : evStart;
        
        const isPast = evEnd < now && evStart < oneHourAgo;

        if (isPast) {
            return true;
        }

        const seriesKey = `${ev.title.trim().toLowerCase()}_${ev.clubId || 'none'}`;
        if (seenRecurringSeries.has(seriesKey)) {
            return false;
        }

        seenRecurringSeries.add(seriesKey);
        return true;
    });
}
