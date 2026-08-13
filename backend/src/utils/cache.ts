import { broadcastChange } from './syncManager';

interface CacheStore {
    [key: string]: { data: any; timestamp: number };
}

const cache: CacheStore = {};
const DEFAULT_TTL = 30000; // 30 seconds

export const getCache = (key: string, ttl = DEFAULT_TTL) => {
    const entry = cache[key];
    if (entry && (Date.now() - entry.timestamp < ttl)) {
        return entry.data;
    }
    return null;
};

export const setCache = (key: string, data: any) => {
    cache[key] = { data, timestamp: Date.now() };
};

export const clearCache = (prefix?: string) => {
    if (!prefix) {
        Object.keys(cache).forEach(k => delete cache[k]);
    } else {
        Object.keys(cache).forEach(k => {
            if (k.startsWith(prefix)) delete cache[k];
        });
    }
    // Instantly notify all connected clients via SSE stream
    broadcastChange(prefix || 'all');
};

// Backwards compatibility helpers
export const getCachedDashboard = (_now?: number) => getCache('dashboard', 15000);
export const setCachedDashboard = (data: any, _now?: number) => setCache('dashboard', data);
export const clearDashboardCache = () => clearCache();
