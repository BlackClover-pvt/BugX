/**
 * auth.test.ts
 * Integration tests for the /auth endpoints using Supertest.
 * The database (Drizzle + pg) and Argon2 are mocked so no real DB connection
 * is needed — tests run completely offline.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ─── Mock: Drizzle DB ─────────────────────────────────────────────────────────
// We mock the entire db module so no real PostgreSQL connection is attempted.

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([
      {
        id: "user-uuid-001",
        displayName: "Test User",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      },
    ]),
  },
  pool: { query: vi.fn() },
}));

// ─── Mock: connect-pg-simple session store ────────────────────────────────────
vi.mock("connect-pg-simple", () => {
  return {
    default: () =>
      class MockPgStore {
        get = vi.fn((sid, cb) => cb(null, null));
        set = vi.fn((sid, session, cb) => cb(null));
        destroy = vi.fn((sid, cb) => cb(null));
        touch = vi.fn((_sid, _session, cb) => cb(null));
        on = vi.fn();
      },
  };
});

// ─── Mock: Argon2 ─────────────────────────────────────────────────────────────
vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$argon2id$hashed"),
    verify: vi.fn().mockResolvedValue(true),
    argon2id: 2,
  },
}));

// ─── Mock: Rate limiter (bypass in tests) ────────────────────────────────────
vi.mock("../middleware/rateLimiter", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  reviewLimiter: (_req: any, _res: any, next: any) => next(),
}));

// Import app AFTER mocks are in place
import app from "../app";

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { db } from "../db";

function mockDbEmpty() {
  (db.limit as any).mockResolvedValue([]);
}

function mockDbUser(overrides = {}) {
  (db.limit as any).mockResolvedValue([
    {
      id: "user-uuid-001",
      displayName: "Test User",
      email: "test@example.com",
      passwordHash: "$argon2id$hashed",
      createdAt: new Date().toISOString(),
      ...overrides,
    },
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbEmpty(); // no existing user by default
  });

  it("201 — creates a new account with valid data", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ displayName: "Alice", email: "alice@test.com", password: "Password123!" });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com"); // from mock returning()
  });

  it("400 — rejects missing displayName", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "a@b.com", password: "Password123!" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("400 — rejects weak password (too short)", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ displayName: "Bob", email: "b@b.com", password: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("400 — rejects invalid email format", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ displayName: "Bob", email: "not-an-email", password: "Password123!" });

    expect(res.status).toBe(400);
  });

  it("409 — rejects duplicate email", async () => {
    // Simulate existing user found in DB
    mockDbUser();

    const res = await request(app)
      .post("/auth/register")
      .send({ displayName: "Alice", email: "alice@test.com", password: "Password123!" });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });
});

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("200 — logs in with correct credentials", async () => {
    mockDbUser();
    const { default: argon2 } = await import("argon2");
    (argon2.verify as any).mockResolvedValue(true);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it("401 — rejects non-existent email", async () => {
    mockDbEmpty(); // user not found

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ghost@test.com", password: "Password123!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("401 — rejects wrong password", async () => {
    mockDbUser();
    const { default: argon2 } = await import("argon2");
    (argon2.verify as any).mockResolvedValue(false); // wrong password

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "WrongPass!" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("400 — rejects missing password field", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });
});

describe("GET /auth/me", () => {
  it("401 — returns unauthorized when not logged in", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("200 — responds successfully", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Logged out");
  });
});
