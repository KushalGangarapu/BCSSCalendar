import { useCallback } from 'react';
import type { Event } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

interface UseDeleteEventResult {
    deleteEvent: (event: Event) => Promise<{ ok: boolean; allFuture: boolean }>;
}

export const useDeleteEvent = (
    onAfterDeleteSeries: () => void,
    onAfterDeleteSingle: (eventId: string) => void
): UseDeleteEventResult => {
    const deleteEvent = useCallback(
        async (event: Event): Promise<{ ok: boolean; allFuture: boolean }> => {
            const confirmDelete = window.confirm('Are you sure you want to delete this event?');
            if (!confirmDelete) return { ok: false, allFuture: false };

            let allFuture = false;
            if (event.recurring) {
                allFuture = window.confirm(
                    'This is a recurring event series.\n\nClick OK to ALSO delete ALL FUTURE occurrences.\nClick Cancel to ONLY delete this specific date.'
                );
            }

            try {
                const r = await fetch(
                    `${API_URL}/api/events/${event.id}?allFuture=${allFuture}`,
                    { method: 'DELETE', credentials: 'include' }
                );
                if (!r.ok) return { ok: false, allFuture };

                if (allFuture) {
                    onAfterDeleteSeries();
                } else {
                    onAfterDeleteSingle(event.id);
                }
                return { ok: true, allFuture };
            } catch {
                return { ok: false, allFuture };
            }
        },
        [onAfterDeleteSeries, onAfterDeleteSingle]
    );

    return { deleteEvent };
};
