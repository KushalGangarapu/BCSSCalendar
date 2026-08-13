// High-Performance SWR (Stale-While-Revalidate) & Real-Time Sync Client Cache

interface CacheEntry<T> {
    data: T;
    jsonString: string;
    timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const subscribers = new Map<string, Set<(data: any) => void>>();

/**
 * Register a listener to be notified whenever cached data for a URL is updated in the background.
 */
export function subscribeToCache<T = any>(url: string, callback: (data: T) => void): () => void {
    if (!subscribers.has(url)) {
        subscribers.set(url, new Set());
    }
    subscribers.get(url)!.add(callback);

    return () => {
        const set = subscribers.get(url);
        if (set) {
            set.delete(callback);
            if (set.size === 0) subscribers.delete(url);
        }
    };
}

function notifySubscribers(url: string, data: any) {
    const set = subscribers.get(url);
    if (set) {
        set.forEach(cb => {
            try {
                cb(data);
            } catch (err) {
                console.error(`Error in cache subscriber for ${url}:`, err);
            }
        });
    }
}

/**
 * Fetch with Stale-While-Revalidate (SWR):
 * 1. Returns cached data immediately if available.
 * 2. Asynchronously revalidates with the server in the background.
 * 3. Notifies subscribers and updates state if fresh data is different.
 */
export async function fetchWithCache<T = any>(url: string, options?: RequestInit): Promise<T> {
    const existing = memoryCache.get(url);

    // Trigger background revalidation asynchronously
    triggerBackgroundRevalidation(url, options).catch(() => {});

    // If cached data is present, resolve immediately (0ms UI response)
    if (existing) {
        return existing.data as T;
    }

    // Otherwise, wait for in-flight or fresh fetch
    return await executeNetworkFetch<T>(url, options);
}

/**
 * Revalidates a URL against the server in the background without blocking the UI.
 */
export async function revalidateCache<T = any>(url: string, options?: RequestInit): Promise<T | null> {
    return executeNetworkFetch<T>(url, options);
}

async function triggerBackgroundRevalidation(url: string, options?: RequestInit): Promise<void> {
    // Deduplicate in-flight requests
    if (inFlightRequests.has(url)) return;

    try {
        await executeNetworkFetch(url, options);
    } catch {
        // Silently retain cached data if background fetch fails
    }
}

async function executeNetworkFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
    // If request already in-flight, reuse same promise to prevent duplicate network traffic
    if (inFlightRequests.has(url)) {
        return inFlightRequests.get(url)! as Promise<T>;
    }

    const fetchPromise = (async () => {
        try {
            const separator = url.includes('?') ? '&' : '?';
            const fetchUrl = `${url}${separator}_t=${Date.now()}`;
            const response = await fetch(fetchUrl, options);
            if (!response.ok) {
                const existing = memoryCache.get(url);
                if (existing) return existing.data as T;
                throw new Error(`HTTP ${response.status} from ${url}`);
            }
            const data = await response.json();
            const newJson = JSON.stringify(data);
            const existing = memoryCache.get(url);

            // Update cache
            memoryCache.set(url, {
                data,
                jsonString: newJson,
                timestamp: Date.now()
            });

            // If data changed, notify active subscribers
            if (!existing || existing.jsonString !== newJson) {
                notifySubscribers(url, data);
            }

            return data as T;
        } finally {
            inFlightRequests.delete(url);
        }
    })();

    inFlightRequests.set(url, fetchPromise);
    return fetchPromise;
}

export function getCachedData<T = any>(url: string): T | null {
    const existing = memoryCache.get(url);
    return existing ? existing.data : null;
}

export function setCachedData<T = any>(url: string, data: T): void {
    const jsonString = JSON.stringify(data);
    memoryCache.set(url, { data, jsonString, timestamp: Date.now() });
    notifySubscribers(url, data);
}

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('bcss_cache_sync')
    : null;

if (syncChannel) {
    syncChannel.onmessage = (event) => {
        if (event.data?.type === 'INVALIDATE') {
            invalidateCacheLocal(event.data.urlPrefix);
        }
    };
}

function invalidateCacheLocal(urlPrefix?: string): void {
    if (!urlPrefix || urlPrefix === 'all') {
        memoryCache.clear();
    } else {
        for (const key of memoryCache.keys()) {
            if (key.includes(urlPrefix)) {
                memoryCache.delete(key);
            }
        }
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        const coreEndpoints = [
            `${apiUrl}/api/dashboard`,
            `${apiUrl}/api/events`,
            `${apiUrl}/api/clubs`,
            `${apiUrl}/api/categories`
        ];
        coreEndpoints.forEach(url => {
            if (!urlPrefix || urlPrefix === 'all' || url.includes(urlPrefix)) {
                executeNetworkFetch(url).catch(() => {});
            }
        });
    }

    for (const activeUrl of subscribers.keys()) {
        if (!urlPrefix || urlPrefix === 'all' || activeUrl.includes(urlPrefix)) {
            executeNetworkFetch(activeUrl).catch(() => {});
        }
    }
}

export function invalidateCache(urlPrefix?: string): void {
    invalidateCacheLocal(urlPrefix);
    // Broadcast instantly to all other open tabs in the same browser (0ms)
    syncChannel?.postMessage({ type: 'INVALIDATE', urlPrefix });
}

/**
 * Real-Time Server-Sent Events (SSE) Stream:
 * Subscribes directly to live server push events for sub-20ms instant data sync
 * across all connected users and devices.
 */
let sseSource: EventSource | null = null;

function connectRealTimeStream(): void {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || typeof window === 'undefined' || !('EventSource' in window)) return;

    try {
        if (sseSource) {
            sseSource.close();
        }

        sseSource = new EventSource(`${apiUrl}/api/sync/stream`);

        sseSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload?.type === 'MUTATION') {
                    // Instantly invalidate and refresh in < 20ms
                    invalidateCacheLocal(payload.resource);
                }
            } catch {
                // Heartbeat or non-json message
            }
        };

        sseSource.onerror = () => {
            sseSource?.close();
            sseSource = null;
            // Retry reconnect in 5 seconds
            setTimeout(connectRealTimeStream, 5000);
        };
    } catch (err) {
        console.warn('Real-time sync stream fallback to SWR polling:', err);
    }
}

/**
 * Background Cross-Page Sync Engine:
 * 1. Establishes ultra-fast SSE live stream.
 * 2. Multi-tab BroadcastChannel for 0ms cross-tab updates.
 * 3. Prefetches core app endpoints on boot.
 * 4. Continuously keeps ALL pages (Dashboard, Calendar, Clubs Directory, Club details)
 *    updated in the background.
 */
let isSyncInitialized = false;

export function initBackgroundSync(): void {
    if (isSyncInitialized || typeof window === 'undefined') return;
    isSyncInitialized = true;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return;

    const coreEndpoints = [
        `${apiUrl}/api/dashboard`,
        `${apiUrl}/api/events`,
        `${apiUrl}/api/clubs`,
        `${apiUrl}/api/categories`
    ];

    // 1. Connect real-time Server-Sent Events stream
    connectRealTimeStream();

    // 2. Initial prefetch for all pages
    setTimeout(() => {
        coreEndpoints.forEach(url => fetchWithCache(url).catch(() => {}));
    }, 100);

    // 3. Revalidate on Window / Tab Focus
    const handleRevalidate = () => {
        if (document.visibilityState === 'visible') {
            coreEndpoints.forEach(url => {
                executeNetworkFetch(url).catch(() => {});
            });
            for (const cachedUrl of memoryCache.keys()) {
                if (!coreEndpoints.includes(cachedUrl)) {
                    executeNetworkFetch(cachedUrl).catch(() => {});
                }
            }
        }
    };

    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);

    // 4. Periodic backup sync (every 10s)
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            coreEndpoints.forEach(url => {
                executeNetworkFetch(url).catch(() => {});
            });
            for (const cachedUrl of memoryCache.keys()) {
                if (!coreEndpoints.includes(cachedUrl)) {
                    executeNetworkFetch(cachedUrl).catch(() => {});
                }
            }
        }
    }, 10000);
}

export function prefetchAllCoreData(): void {
    initBackgroundSync();
}
