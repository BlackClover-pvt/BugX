import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db";

// Augment express-session types so req.session.userId is recognized
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgStore = connectPgSimple(session);

const sessionMiddleware = session({
  store: new PgStore({
    pool: pool,               // reuse the existing pg Pool connected to Supabase
    tableName: "session",     // matches the table name in our Drizzle schema
    createTableIfMissing: false, // table already exists from our migration
  }),
  secret: process.env.SESSION_SECRET || "fallback_secret_change_me",
  resave: false,              // don't save session if unmodified
  saveUninitialized: false,   // don't create session until something is stored
  cookie: {
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
    httpOnly: true,           // prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",          // protects against CSRF while allowing normal navigation
  },
});

export default sessionMiddleware;
