const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints (if added later)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes'
  }
});

// Export limiter for specific routes
const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: 'Rate limit exceeded', message },
  standardHeaders: true
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};