/**
 * review.test.ts
 * Integration tests for:
 *   1. Review submission validation (code too large, bad language, missing fields)
 *   2. AI mock suite (successful parse, malformed JSON, network failure)
 *   3. Authorization (user A cannot access/delete user B's review)
 *
 * All external dependencies (DB, AI, session store) are mocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ─── Mock: Drizzle DB ─────────────────────────────────────────────────────────

const MOCK_USER_A_ID = "aaaaaaaa-0000-0000-0000-000000000001";
const MOCK_USER_B_ID = "bbbbbbbb-0000-0000-0000-000000000002";
const MOCK_REVIEW_ID = "rrrrrrrr-0000-0000-0000-000000000001";

// We track the "current DB state" via this object
let dbReviewOwnerId = MOCK_USER_A_ID;

vi.mock("../db", () => {
  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    // returning() is called in multiple places — we set it per test
    returning: vi.fn(),
    orderBy: vi.fn().mockResolvedValue([]),
  };
  return { db: mockDb, pool: { query: vi.fn() } };
});

// ─── Mock: Session store ──────────────────────────────────────────────────────

vi.mock("connect-pg-simple", () => ({
  default: () =>
    class MockStore {
      get = vi.fn((sid, cb) => cb(null, null));
      set = vi.fn((sid, session, cb) => cb(null));
      destroy = vi.fn((sid, cb) => cb(null));
      touch = vi.fn((_sid, _session, cb) => cb(null));
      on = vi.fn();
    },
}));

// ─── Mock: Argon2 ─────────────────────────────────────────────────────────────

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$argon2id$hashed"),
    verify: vi.fn().mockResolvedValue(true),
    argon2id: 2,
  },
}));

// ─── Mock: Rate limiters (bypass) ─────────────────────────────────────────────

vi.mock("../middleware/rateLimiter", () => ({
  authLimiter: (_req: any, _res: any, next: any) => next(),
  reviewLimiter: (_req: any, _res: any, next: any) => next(),
}));

// ─── Mock: AI Service ─────────────────────────────────────────────────────────

const mockGenerateStructuredReview = vi.fn();
vi.mock("../services/ai.service", () => ({
  generateStructuredReview: (...args: any[]) => mockGenerateStructuredReview(...args),
}));

// ─── Import app + db AFTER mocks ─────────────────────────────────────────────

import app from "../app";
import { db } from "../db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_AI_RESPONSE = JSON.stringify({
  summary: "Code is solid with one minor issue.",
  overallRisk: "LOW",
  findings: [
    {
      title: "Magic number",
      severity: "INFO",
      category: "READABILITY",
      startLine: 2,
      endLine: 2,
      explanation: "The number 1 appears twice as a magic constant.",
      impact: null,
      recommendation: "Extract to a named constant.",
      suggestedCode: "const ONE = 1;\nreturn ONE + ONE;",
    },
  ],
});

/**
 * Helper to inject a fake session so the request appears authenticated.
 * We monkey-patch the session middleware mock to set req.session.userId.
 */
function buildAuthenticatedAgent(userId: string) {
  // We use a real supertest agent and intercept via the sessionMiddleware
  // by passing a custom header — but because our session store is fully mocked,
  // we need to inject the userId directly into the request.
  // The simplest approach: override the connect-pg-simple mock's `get` to
  // return a fake session containing userId for the given cookie.
  return { userId };
}

// Set up DB mocks for a successful review flow
function setupSuccessfulReviewMocks(userId: string) {
  const pendingReview = {
    id: MOCK_REVIEW_ID,
    userId,
    title: "function sum()",
    language: "javascript",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  const completedReview = { ...pendingReview, status: "COMPLETED", overallRisk: "LOW", overallSummary: "Code is solid." };
  const mockFinding = {
    id: "find-001",
    reviewId: MOCK_REVIEW_ID,
    title: "Magic number",
    severity: "INFO",
    category: "READABILITY",
    explanation: "The number 1 appears.",
    recommendation: "Extract constant.",
    createdAt: new Date().toISOString(),
  };

  // insert().values().returning() → pending review
  // update().set().where().returning() → completed review
  // insert().values().returning() → findings
  let returningCallCount = 0;
  (db.returning as any).mockImplementation(() => {
    returningCallCount++;
    if (returningCallCount === 1) return Promise.resolve([pendingReview]);
    if (returningCallCount === 2) return Promise.resolve([completedReview]);
    return Promise.resolve([mockFinding]);
  });
}

// ─── 1. Review Validation Suite ───────────────────────────────────────────────

describe("POST /reviews — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("401 — rejects unauthenticated requests", async () => {
    const res = await request(app)
      .post("/reviews")
      .send({ code: "console.log('hi')", language: "javascript" });

    expect(res.status).toBe(401);
  });

  it("400 — rejects missing code field", async () => {
    // We test the validator directly since auth would block first
    const { createReviewSchema } = await import("../validators/review.validator");
    const result = createReviewSchema.safeParse({ language: "python" });
    expect(result.success).toBe(false);
  });

  it("400 — rejects code exceeding 10,240 bytes", async () => {
    const { createReviewSchema } = await import("../validators/review.validator");
    const result = createReviewSchema.safeParse({ code: "x".repeat(10_241) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("10");
    }
  });

  it("400 — rejects unsupported language", async () => {
    const { createReviewSchema } = await import("../validators/review.validator");
    const result = createReviewSchema.safeParse({
      code: "print('hello')",
      language: "cobol",
    });
    expect(result.success).toBe(false);
  });
});

// ─── 2. AI Mock Suite ─────────────────────────────────────────────────────────

describe("AI response handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses and saves a valid structured JSON response from Gemini", async () => {
    mockGenerateStructuredReview.mockResolvedValue(VALID_AI_RESPONSE);

    setupSuccessfulReviewMocks(MOCK_USER_A_ID);

    // The route is auth-gated — call the controller directly via unit test
    const { createReview } = await import("../controllers/review.controller");

    const mockReq: any = {
      body: { code: "function sum() { return 1 + 1; }", language: "javascript", reviewFocus: ["GENERAL"] },
      session: { userId: MOCK_USER_A_ID },
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await createReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    const responseArg = mockRes.json.mock.calls[0][0];
    expect(responseArg).toHaveProperty("review");
    expect(responseArg).toHaveProperty("findings");
  });

  it("returns 502 when AI returns malformed JSON (not parseable)", async () => {
    mockGenerateStructuredReview.mockResolvedValue("not valid json at all {{{");

    // Only the first returning() call (pending insert) should resolve
    (db.returning as any).mockImplementation(() => Promise.resolve([{
      id: MOCK_REVIEW_ID, userId: MOCK_USER_A_ID, status: "PENDING",
    }]));

    const { createReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      body: { code: "x", language: "javascript", reviewFocus: ["GENERAL"] },
      session: { userId: MOCK_USER_A_ID },
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await createReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    const responseArg = mockRes.json.mock.calls[0][0];
    expect(responseArg.error).toBe("AI review failed");
  });

  it("returns 502 when AI returns JSON that fails Zod validation", async () => {
    const badJson = JSON.stringify({
      summary: "ok",
      overallRisk: "EXTREME_DANGER", // invalid enum
      findings: [],
    });
    mockGenerateStructuredReview.mockResolvedValue(badJson);

    (db.returning as any).mockImplementation(() => Promise.resolve([{
      id: MOCK_REVIEW_ID, userId: MOCK_USER_A_ID, status: "PENDING",
    }]));

    const { createReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      body: { code: "x", language: "javascript", reviewFocus: ["GENERAL"] },
      session: { userId: MOCK_USER_A_ID },
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await createReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(502);
  });

  it("returns 502 on network timeout / AI service failure", async () => {
    mockGenerateStructuredReview.mockRejectedValue(new Error("DEADLINE_EXCEEDED: Gemini timed out"));

    (db.returning as any).mockImplementation(() => Promise.resolve([{
      id: MOCK_REVIEW_ID, userId: MOCK_USER_A_ID, status: "PENDING",
    }]));

    const { createReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      body: { code: "x", language: "javascript", reviewFocus: ["GENERAL"] },
      session: { userId: MOCK_USER_A_ID },
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await createReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(502);
    const responseArg = mockRes.json.mock.calls[0][0];
    expect(responseArg.error).toBe("AI review failed");
    expect(responseArg.details).toContain("DEADLINE_EXCEEDED");
  });
});

// ─── 3. Authorization Suite ───────────────────────────────────────────────────

describe("Authorization — cross-user data isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /reviews/:id — user B cannot read user A's review (404)", async () => {
    // DB returns empty (no row matching both id AND userId for User B)
    (db.limit as any).mockResolvedValue([]);

    const { getReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      params: { id: MOCK_REVIEW_ID },
      session: { userId: MOCK_USER_B_ID }, // user B trying to read A's review
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await getReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Review not found" });
  });

  it("DELETE /reviews/:id — user B cannot delete user A's review (404)", async () => {
    // DB delete returns nothing (ownership check fails)
    (db.returning as any).mockResolvedValue([]);

    const { deleteReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      params: { id: MOCK_REVIEW_ID },
      session: { userId: MOCK_USER_B_ID }, // user B trying to delete A's review
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await deleteReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Review not found" });
  });

  it("GET /reviews/:id — user A CAN read their own review (200)", async () => {
    const ownReview = {
      id: MOCK_REVIEW_ID,
      userId: MOCK_USER_A_ID,
      title: "My review",
      status: "COMPLETED",
    };
    (db.limit as any).mockResolvedValue([ownReview]);
    (db.orderBy as any).mockResolvedValue([]); // no findings

    const { getReview } = await import("../controllers/review.controller");
    const mockReq: any = {
      params: { id: MOCK_REVIEW_ID },
      session: { userId: MOCK_USER_A_ID }, // correct owner
    };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    await getReview(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const responseArg = mockRes.json.mock.calls[0][0];
    expect(responseArg.review.id).toBe(MOCK_REVIEW_ID);
  });
});
