/**
 * Redis Cache Service
 * Provides caching layer for frequently accessed data
 * Falls back gracefully if Redis is unavailable
 */
let redis = null;
let isConnected = false;

const initRedis = async () => {
  try {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true
    });

    await redis.connect();
    isConnected = true;
    console.log('Redis connected');

    redis.on('error', (err) => {
      console.warn('Redis error:', err.message);
      isConnected = false;
    });

    redis.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    redis.on('connect', () => {
      isConnected = true;
    });
  } catch (err) {
    console.warn('Redis not available, running without cache:', err.message);
    isConnected = false;
  }
};

const cacheGet = async (key) => {
  if (!isConnected || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!isConnected || !redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently fail
  }
};

const cacheDel = async (pattern) => {
  if (!isConnected || !redis) return;
  try {
    if (pattern.includes('*')) {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(pattern);
    }
  } catch {
    // Silently fail
  }
};

const cacheFlush = async () => {
  if (!isConnected || !redis) return;
  try {
    await redis.flushdb();
  } catch {
    // Silently fail
  }
};

/**
 * Cache middleware - caches GET request responses
 * @param {number} ttl - Time to live in seconds
 * @param {Function} keyGenerator - Optional function to generate cache key
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !isConnected) return next();

    const key = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl}:${req.user?._id || 'anon'}`;

    try {
      const cached = await cacheGet(key);
      if (cached) {
        return res.json(cached);
      }
    } catch {
      return next();
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cacheSet(key, data, ttl).catch(() => {});
      return originalJson(data);
    };
    next();
  };
};

module.exports = {
  initRedis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheFlush,
  cacheMiddleware
};
