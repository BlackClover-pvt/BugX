/**
 * validator.test.ts
 * Pure unit tests for Zod schemas — no database, no network calls.
 * Runs instantly with zero external dependencies.
 */

import { describe, it, expect } from "vitest";
import { createReviewSchema, SUPPORTED_LANGUAGES, REVIEW_FOCUS_OPTIONS } from "../validators/review.validator";
import { structuredReviewSchema } from "../validators/aiResponse.validator";

// ─── Review Submission Validator ─────────────────────────────────────────────

describe("createReviewSchema", () => {

  it("accepts valid minimal input (code only)", () => {
    const result = createReviewSchema.safeParse({ code: "console.log('hello')" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("javascript");  // default
      expect(result.data.reviewFocus).toEqual(["GENERAL"]); // default
    }
  });

  it("accepts valid full input with all fields", () => {
    const result = createReviewSchema.safeParse({
      code: "def foo(): pass",
      language: "python",
      title: "My Python Script",
      reviewFocus: ["SECURITY", "PERFORMANCE"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = createReviewSchema.safeParse({ code: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages.some(m => m.toLowerCase().includes("required") || m.toLowerCase().includes("least"))).toBe(true);
    }
  });

  it("rejects code exceeding 10,240 bytes", () => {
    const bigCode = "x".repeat(10_241);
    const result = createReviewSchema.safeParse({ code: bigCode });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      expect(messages.some(m => m.includes("10"))).toBe(true);
    }
  });

  it("accepts code exactly at 10,240 bytes", () => {
    const maxCode = "x".repeat(10_240);
    const result = createReviewSchema.safeParse({ code: maxCode });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported language", () => {
    const result = createReviewSchema.safeParse({
      code: "some code",
      language: "brainfuck",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all supported languages", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const result = createReviewSchema.safeParse({ code: "x", language: lang });
      expect(result.success, `Expected '${lang}' to be a valid language`).toBe(true);
    }
  });

  it("rejects empty reviewFocus array", () => {
    const result = createReviewSchema.safeParse({
      code: "x",
      reviewFocus: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid reviewFocus value", () => {
    const result = createReviewSchema.safeParse({
      code: "x",
      reviewFocus: ["INVALID_FOCUS"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 200 characters", () => {
    const result = createReviewSchema.safeParse({
      code: "x",
      title: "T".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title exactly at 200 characters", () => {
    const result = createReviewSchema.safeParse({
      code: "x",
      title: "T".repeat(200),
    });
    expect(result.success).toBe(true);
  });
});

// ─── AI Response Validator ────────────────────────────────────────────────────

describe("structuredReviewSchema", () => {

  const validReview = {
    summary: "Code is generally solid with minor issues.",
    overallRisk: "MEDIUM",
    findings: [
      {
        title: "Potential null dereference",
        severity: "HIGH",
        category: "CORRECTNESS",
        startLine: 10,
        endLine: 12,
        explanation: "The variable may be null here.",
        impact: "App crash in production.",
        recommendation: "Add a null check before accessing the property.",
        suggestedCode: "if (x != null) { x.doThing(); }",
      },
    ],
  };

  it("accepts a fully valid structured review", () => {
    const result = structuredReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts a review with zero findings", () => {
    const result = structuredReviewSchema.safeParse({
      ...validReview,
      findings: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable optional fields (startLine, endLine, impact, suggestedCode)", () => {
    const result = structuredReviewSchema.safeParse({
      summary: "Good code.",
      overallRisk: "LOW",
      findings: [
        {
          title: "Minor style issue",
          severity: "INFO",
          category: "READABILITY",
          startLine: null,
          endLine: null,
          explanation: "Variable names could be clearer.",
          impact: null,
          recommendation: "Rename variables for clarity.",
          suggestedCode: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity value", () => {
    const bad = { ...validReview, findings: [{ ...validReview.findings[0], severity: "EXTREME" }] };
    const result = structuredReviewSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects invalid overallRisk value", () => {
    const result = structuredReviewSchema.safeParse({ ...validReview, overallRisk: "NONE" });
    expect(result.success).toBe(false);
  });

  it("rejects missing summary", () => {
    const { summary, ...noSummary } = validReview;
    const result = structuredReviewSchema.safeParse(noSummary);
    expect(result.success).toBe(false);
  });

  it("rejects empty summary", () => {
    const result = structuredReviewSchema.safeParse({ ...validReview, summary: "" });
    expect(result.success).toBe(false);
  });

  it("rejects finding with missing required fields", () => {
    const result = structuredReviewSchema.safeParse({
      ...validReview,
      findings: [{ title: "Missing fields" }],
    });
    expect(result.success).toBe(false);
  });
});
