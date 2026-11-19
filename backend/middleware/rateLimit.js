const rateLimit = require("express-rate-limit");

const base = { standardHeaders: "draft-7", legacyHeaders: false };
const msg = (message) => ({ success: false, message });

// Broad safety net for every route (per IP).
const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: msg("Too many requests. Please slow down."),
});

// Signup/login/logout/me endpoints (per IP).
const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: msg("Too many attempts. Please try again later."),
});

// Brute-force protection: failed logins per email address (successful logins don't count).
const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `login:${req.body?.Email || "unknown"}`,
  message: msg("Too many failed login attempts. Please try again in 15 minutes."),
});

// AI cost protection, per logged-in user (must run after requireAuth).
const aiBurstLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `ai-min:${req.user.id}`,
  message: msg("You're reviewing too fast. Wait a minute and try again."),
});

const aiHourlyLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `ai-hour:${req.user.id}`,
  message: msg("Hourly review limit reached. Please try again later."),
});

module.exports = { globalLimiter, authLimiter, loginLimiter, aiBurstLimiter, aiHourlyLimiter };
