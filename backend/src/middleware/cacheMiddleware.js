import NodeCache from "node-cache";

// Standard Time-To-Live: 60 seconds (1 minute default)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * Express middleware to cache GET requests in-memory.
 * Greatly reduces database load for high-traffic endpoints.
 * @param {number} duration - Cache duration in seconds
 */
export const cacheMiddleware = (duration = 60) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        // Use the exact requested URL (with query params) as the cache key
        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`[CACHE HIT] Delivering cached data for: ${key}`);
            return res.send(cachedResponse);
        } else {
            // console.log(`[CACHE MISS] Fetching fresh data for: ${key}`);
            // Intercept the res.send method to store the payload before sending
            res.originalSend = res.send;
            res.send = (body) => {
                res.originalSend(body);
                // Only cache successful JSON responses (status 200/201)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(key, body, duration);
                }
            };
            next();
        }
    };
};

/**
 * Utility to manually clear cache for a specific path.
 * Useful when mutating data that invalidates a cache.
 */
export const clearCache = (keyPattern) => {
    const keys = cache.keys();
    keys.forEach(k => {
        if (k.includes(keyPattern)) {
            cache.del(k);
        }
    });
};
