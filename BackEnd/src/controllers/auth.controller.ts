import { Request, Response } from "express";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { registerSchema, loginSchema } from "../validators/auth.validator";

// ─── Register ───────────────────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<any> {
  try {
    // 1. Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues.map((e) => e.message),
      });
    }

    const { displayName, email, password } = parsed.data;

    // 2. Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // 3. Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    // 4. Insert user into database
    const [newUser] = await db
      .insert(users)
      .values({ displayName, email, passwordHash })
      .returning({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        createdAt: users.createdAt,
      });

    // 5. Save userId in session (auto-login after registration)
    req.session.userId = newUser.id;

    return res.status(201).json({
      message: "Account created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Login ──────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<any> {
  try {
    // 1. Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues.map((e) => e.message),
      });
    }

    const { email, password } = parsed.data;

    // 2. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Verify password
    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 4. Save userId in session
    req.session.userId = user.id;

    return res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Logout ─────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // clear the session cookie from the browser
    return res.status(200).json({ message: "Logged out successfully" });
  });
}

// ─── Get Current User ───────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response) {
  try {
    // If no session userId, user is not logged in
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch user from database (excluding passwordHash)
    const [user] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
