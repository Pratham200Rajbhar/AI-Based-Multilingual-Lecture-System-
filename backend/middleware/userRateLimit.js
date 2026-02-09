/**
 * Per-user rate limiting middleware
 * Different limits based on user role
 */
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (now - value.windowStart > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

const roleLimits = {
  student: 100,      // 100 req/min
  professor: 200,    // 200 req/min
  dept_admin: 300,   // 300 req/min
  inst_admin: 400,   // 400 req/min
  super_admin: 500   // 500 req/min
};

const userRateLimit = (req, res, next) => {
  if (!req.user) return next();

  const userId = req.user._id.toString();
  const role = req.user.role;
  const maxRequests = roleLimits[role] || 100;
  const windowMs = 60000; // 1 minute window

  const now = Date.now();
  let entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now };
    rateLimitStore.set(userId, entry);
  }

  entry.count++;

  // Set rate limit headers
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetTime = Math.ceil((entry.windowStart + windowMs) / 1000);

  res.set({
    'X-RateLimit-Limit': maxRequests,
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': resetTime
  });

  if (entry.count > maxRequests) {
    return res.status(429).json({
      message: 'Too many requests. Please slow down.',
      retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000)
    });
  }

  next();
};

module.exports = userRateLimit;
