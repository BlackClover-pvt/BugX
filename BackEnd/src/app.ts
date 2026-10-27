import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import sessionMiddleware from './middleware/session';
import authRoutes from './routes/auth.routes';
import reviewRoutes from './routes/review.routes';
import { authLimiter } from './middleware/rateLimiter';

// Legacy AI route
const aiRoutes = require('./routes/ai.routes');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Explicitly whitelist the frontend origin and allow cookies to be sent cross-origin.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ─── Session ──────────────────────────────────────────────────────────────────
// Must be mounted before any route that reads or writes req.session.
app.use(sessionMiddleware);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'BugX API', version: '1.0.0' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// /ai  — legacy stateless route (no rate-limit needed; auth-gated downstream)
app.use('/ai', aiRoutes);

// /auth — rate-limited to prevent brute-force on login/register
app.use('/auth', authLimiter, authRoutes);

// /reviews — reviewLimiter is applied only to POST (create) inside review.routes; GET/DELETE are not limited.
app.use('/reviews', reviewRoutes);

// ─── Centralized Error Handler ────────────────────────────────────────────────
// This MUST be the last app.use() call.
// Catches any unhandled errors thrown or passed via next(err) anywhere in the app.
// Returns a generic message so internal details (SQL, stack traces, API keys)
// are never exposed to the client.
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Always log the full error server-side for debugging
  console.error('[Unhandled Error]', {
    method: req.method,
    url: req.url,
    message: err?.message,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  });

  // Determine a safe HTTP status code
  const status =
    typeof err?.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  // Never leak internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(status).json({
    error: status === 429 ? err.message : 'An unexpected error occurred.',
    ...(isProduction
      ? {}
      : { details: err?.message }), // show details only in development
  });
});

export default app;
export { app };
