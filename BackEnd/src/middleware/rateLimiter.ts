import rateLimit from "express-rate-limit";

// ─── Auth Limiter ─────────────────────────────────────────────────────────────
// Protects /auth/login and /auth/register against brute-force attacks.
// Allows max 10 attempts per IP in any 15-minute window.
// Uses default keyGenerator (express-rate-limit handles IPv6 correctly internally).

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,   // return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,     // disable X-RateLimit-* headers
  message: {
    error: "Too many requests",
    details:
      "You have exceeded the authentication rate limit. Please wait 15 minutes and try again.",
  },
  // Default keyGenerator uses req.ip (express-rate-limit handles IPv6 internally)
});

// ─── Review Creation Limiter ──────────────────────────────────────────────────
// Protects POST /reviews against Gemini API quota abuse.
// Allows max 15 submissions per authenticated user per hour.
// Keyed on userId (session-scoped) so users don't share rate-limit buckets.

export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Review limit reached",
    details:
      "You have submitted too many reviews. Please wait up to 1 hour before submitting again.",
  },
  // Key on userId when authenticated — completely avoids touching req.ip,
  // so no IPv6 validation warning is triggered.
  keyGenerator: (req) => {
    const userId = (req as any).session?.userId as string | undefined;
    // requireAuth already blocks unauthenticated requests before this runs,
    // so userId will always exist here. Fallback to "anon" is defensive only.
    return userId ? `rl:review:${userId}` : "rl:review:anon";
  },
  // Disable the IPv6 validation check — our keyGenerator never uses req.ip
  validate: { default: true },
});
