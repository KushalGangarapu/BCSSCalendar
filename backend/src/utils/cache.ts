let cachedDashboard: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15000; // 15 seconds

export const getCachedDashboard = (now: number) => {
    if (cachedDashboard && (now - cacheTimestamp < CACHE_TTL)) {
        return cachedDashboard;
    }
    return null;
};

export const setCachedDashboard = (data: any, now: number) => {
    cachedDashboard = data;
    cacheTimestamp = now;
};

export const clearDashboardCache = () => {
    cachedDashboard = null;
    cacheTimestamp = 0;
};
