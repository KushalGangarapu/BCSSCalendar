import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface EventItem {
    id: string;
    title: string;
    date: string;
    endDate?: string | null;
    description?: string | null;
    clubId?: string | null;
    recurring?: string | null;
    tags?: string[];
    club?: { id: string; name: string; category?: string; imageUrl?: string };
}

export interface ClubItem {
    id: string;
    name: string;
    category: string;
    description?: string | null;
    instagram?: string | null;
    discord?: string | null;
    imageUrl?: string | null;
    isFeatured?: boolean;
    events?: EventItem[];
}

export interface CategoryItem {
    name: string;
    color: string;
}

export interface MetricsData {
    pageVisits?: number;
    clubCount?: number;
    eventCount?: number;
}

interface DataContextType {
    events: EventItem[];
    clubs: ClubItem[];
    categories: CategoryItem[];
    metrics: MetricsData;
    loading: boolean;
    refreshData: (resource?: string) => Promise<void>;
    addOptimisticEvent: (event: EventItem) => void;
    updateOptimisticEvent: (event: EventItem) => void;
    deleteOptimisticEvent: (id: string) => void;
    addOptimisticClub: (club: ClubItem) => void;
    updateOptimisticClub: (club: ClubItem) => void;
    deleteOptimisticClub: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEYS = {
    EVENTS: 'bcss_cache_events_v3',
    CLUBS: 'bcss_cache_clubs_v3',
    CATEGORIES: 'bcss_cache_categories_v3',
    METRICS: 'bcss_cache_metrics_v3',
};

const safeJsonParse = <T,>(key: string, fallback: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const safeJsonSave = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // Handle storage quota gracefully
    }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 0ms instant initialization from persisted disk cache
    const [events, setEvents] = useState<EventItem[]>(() => safeJsonParse(STORAGE_KEYS.EVENTS, []));
    const [clubs, setClubs] = useState<ClubItem[]>(() => safeJsonParse(STORAGE_KEYS.CLUBS, []));
    const [categories, setCategories] = useState<CategoryItem[]>(() => safeJsonParse(STORAGE_KEYS.CATEGORIES, []));
    const [metrics, setMetrics] = useState<MetricsData>(() => safeJsonParse(STORAGE_KEYS.METRICS, {}));
    const [loading, setLoading] = useState(events.length === 0 && clubs.length === 0);

    const isFetchingRef = useRef<{ [key: string]: boolean }>({});
    const channelRef = useRef<BroadcastChannel | null>(null);
    const sseRef = useRef<EventSource | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch and sync data with high-speed Unified Bootstrap
    const syncResource = useCallback(async (resource: string = 'all') => {
        if (!apiUrl) return;
        if (isFetchingRef.current[resource]) return;
        isFetchingRef.current[resource] = true;

        try {
            if (resource === 'all') {
                const res = await fetch(`${apiUrl}/api/bootstrap`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.events) {
                        setEvents(data.events);
                        safeJsonSave(STORAGE_KEYS.EVENTS, data.events);
                    }
                    if (data.clubs) {
                        setClubs(data.clubs);
                        safeJsonSave(STORAGE_KEYS.CLUBS, data.clubs);
                    }
                    if (data.categories) {
                        setCategories(data.categories);
                        safeJsonSave(STORAGE_KEYS.CATEGORIES, data.categories);
                    }
                    if (data.metrics) {
                        setMetrics(data.metrics);
                        safeJsonSave(STORAGE_KEYS.METRICS, data.metrics);
                    }
                }
            } else if (resource === 'events') {
                const res = await fetch(`${apiUrl}/api/events`);
                if (res.ok) {
                    const freshEvents = await res.json();
                    setEvents(freshEvents);
                    safeJsonSave(STORAGE_KEYS.EVENTS, freshEvents);
                }
            } else if (resource === 'clubs') {
                const res = await fetch(`${apiUrl}/api/clubs`);
                if (res.ok) {
                    const freshClubs = await res.json();
                    setClubs(freshClubs);
                    safeJsonSave(STORAGE_KEYS.CLUBS, freshClubs);
                }
            } else if (resource === 'categories') {
                const res = await fetch(`${apiUrl}/api/categories`);
                if (res.ok) {
                    const freshCategories = await res.json();
                    setCategories(freshCategories);
                    safeJsonSave(STORAGE_KEYS.CATEGORIES, freshCategories);
                }
            } else if (resource === 'metrics') {
                const res = await fetch(`${apiUrl}/api/metrics`);
                if (res.ok) {
                    const freshMetrics = await res.json();
                    setMetrics(freshMetrics);
                    safeJsonSave(STORAGE_KEYS.METRICS, freshMetrics);
                }
            }
        } catch (err) {
            console.warn(`Background sync error for ${resource}:`, err);
        } finally {
            isFetchingRef.current[resource] = false;
            setLoading(false);
        }
    }, [apiUrl]);

    const refreshData = useCallback(async (resource?: string) => {
        await syncResource(resource || 'all');
        // Broadcast across all open browser tabs in 0ms
        channelRef.current?.postMessage({ type: 'SYNC_RESOURCE', resource: resource || 'all' });
    }, [syncResource]);

    // Optimistic Update Helpers (Instant 0.0ms UI response)
    const addOptimisticEvent = useCallback((newEvent: EventItem) => {
        setEvents(prev => {
            const updated = [newEvent, ...prev.filter(e => e.id !== newEvent.id)];
            safeJsonSave(STORAGE_KEYS.EVENTS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'events' });
    }, []);

    const updateOptimisticEvent = useCallback((updatedEvent: EventItem) => {
        setEvents(prev => {
            const updated = prev.map(e => e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e);
            safeJsonSave(STORAGE_KEYS.EVENTS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'events' });
    }, []);

    const deleteOptimisticEvent = useCallback((id: string) => {
        setEvents(prev => {
            const updated = prev.filter(e => e.id !== id);
            safeJsonSave(STORAGE_KEYS.EVENTS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'events' });
    }, []);

    const addOptimisticClub = useCallback((newClub: ClubItem) => {
        setClubs(prev => {
            const updated = [newClub, ...prev.filter(c => c.id !== newClub.id)];
            safeJsonSave(STORAGE_KEYS.CLUBS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'clubs' });
    }, []);

    const updateOptimisticClub = useCallback((updatedClub: ClubItem) => {
        setClubs(prev => {
            const updated = prev.map(c => c.id === updatedClub.id ? { ...c, ...updatedClub } : c);
            safeJsonSave(STORAGE_KEYS.CLUBS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'clubs' });
    }, []);

    const deleteOptimisticClub = useCallback((id: string) => {
        setClubs(prev => {
            const updated = prev.filter(c => c.id !== id);
            safeJsonSave(STORAGE_KEYS.CLUBS, updated);
            return updated;
        });
        channelRef.current?.postMessage({ type: 'MUTATION', resource: 'clubs' });
    }, []);

    useEffect(() => {
        // 0. Track unique visitor globally across any entry page
        const visitKey = 'bcss_has_visited_v2';
        if (typeof window !== 'undefined' && !localStorage.getItem(visitKey)) {
            localStorage.setItem(visitKey, 'true');
            if (apiUrl) {
                fetch(`${apiUrl}/api/metrics/visit`, { method: 'POST' }).catch(console.error);
            }
        }

        // 1. Initial immediate background sync (1 fast call)
        syncResource('all');

        // 2. Multi-tab BroadcastChannel setup (0ms inter-tab bus)
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const channel = new BroadcastChannel('bcss_global_sync_v3');
            channel.onmessage = (event) => {
                if (event.data?.type === 'SYNC_RESOURCE' || event.data?.type === 'MUTATION') {
                    syncResource(event.data.resource || 'all');
                }
            };
            channelRef.current = channel;
        }

        // 3. Real-Time Server-Sent Events (SSE) Stream
        const setupSSE = () => {
            if (!apiUrl || typeof window === 'undefined' || !('EventSource' in window)) return;
            if (sseRef.current) sseRef.current.close();

            try {
                const sse = new EventSource(`${apiUrl}/api/sync/stream`);
                sse.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload?.type === 'MUTATION') {
                            if (payload.data) {
                                if (payload.data.events) {
                                    setEvents(payload.data.events);
                                    safeJsonSave(STORAGE_KEYS.EVENTS, payload.data.events);
                                }
                                if (payload.data.clubs) {
                                    setClubs(payload.data.clubs);
                                    safeJsonSave(STORAGE_KEYS.CLUBS, payload.data.clubs);
                                }
                                if (payload.data.categories) {
                                    setCategories(payload.data.categories);
                                    safeJsonSave(STORAGE_KEYS.CATEGORIES, payload.data.categories);
                                }
                            } else {
                                syncResource(payload.resource || 'all');
                            }
                        }
                    } catch {
                        // Heartbeat
                    }
                };

                sse.onerror = () => {
                    sse.close();
                    sseRef.current = null;
                    // Reconnect after 3s
                    setTimeout(setupSSE, 3000);
                };

                sseRef.current = sse;
            } catch (err) {
                console.warn('SSE stream error, using SWR fallback:', err);
            }
        };

        setupSSE();

        // 4. Window focus / visibility change revalidation
        const handleFocus = () => {
            if (document.visibilityState === 'visible') {
                syncResource('all');
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleFocus);

        // 5. Periodic background heartbeat (every 8 seconds)
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                syncResource('all');
            }
        }, 8000);

        return () => {
            channelRef.current?.close();
            sseRef.current?.close();
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
            clearInterval(intervalId);
        };
    }, [apiUrl, syncResource]);

    return (
        <DataContext.Provider value={{
            events,
            clubs,
            categories,
            metrics,
            loading,
            refreshData,
            addOptimisticEvent,
            updateOptimisticEvent,
            deleteOptimisticEvent,
            addOptimisticClub,
            updateOptimisticClub,
            deleteOptimisticClub,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useAppData must be used within a DataProvider');
    }
    return context;
};
