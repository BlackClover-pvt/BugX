import { Request, Response, NextFunction } from "express";

/**
 * Middleware guard — rejects any request that does not have an active session.
 * Mount this on any route (or router) that requires a logged-in user.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  next();
}
