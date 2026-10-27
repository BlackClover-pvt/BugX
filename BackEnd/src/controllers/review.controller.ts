import { Request, Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { reviews, reviewFindings } from "../db/schema";
import { createReviewSchema } from "../validators/review.validator";
import {
  structuredReviewSchema,
  type StructuredReview,
} from "../validators/aiResponse.validator";

import { generateStructuredReview } from "../services/ai.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a short, readable title from the first non-empty line of code. */
function autoTitle(code: string): string {
  const firstLine = code.split("\n").find((l) => l.trim().length > 0) ?? "";
  const trimmed = firstLine.trim().slice(0, 80);
  return trimmed || `Code Review — ${new Date().toLocaleString()}`;
}

// ─── POST /reviews ────────────────────────────────────────────────────────────
/**
 * Submit code for an AI review.
 * Flow:
 *   1. Validate body with Zod
 *   2. Insert a PENDING review record into PostgreSQL
 *   3. Call the Gemini AI service (JSON mode)
 *   4. Validate AI JSON with Zod (structuredReviewSchema)
 *   5a. On success → in one transaction:
 *         - Update review to COMPLETED (overallSummary, overallRisk)
 *         - Bulk-insert all findings into review_findings
 *   5b. On AI or parse failure → update review to FAILED
 *   6. Return { review, findings }
 */
export async function createReview(req: Request, res: Response): Promise<any> {
  try {
    // 1. Validate input
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues.map((e) => e.message),
      });
    }

    const { code, language, title, reviewFocus } = parsed.data;
    const userId = req.session.userId!;
    const reviewTitle = title || autoTitle(code);
    const langValue = language ?? "javascript";
    const focusArray = reviewFocus ?? ["GENERAL"];

    // 2. Insert a PENDING review record
    const [pending] = await db
      .insert(reviews)
      .values({
        userId,
        title: reviewTitle,
        language: langValue,
        reviewFocus: JSON.stringify(focusArray),
        sourceType: "PASTED",
        codeContent: code,
        status: "PENDING",
        provider: "google",
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      })
      .returning();

    // 3 & 4. Call AI, parse and validate JSON response
    try {
      const aiRawText: string = await generateStructuredReview({
        code,
        language: langValue,
        reviewFocus: focusArray,
      });

      // Parse JSON from the AI response
      let aiData: StructuredReview;
      try {
        const jsonParsed = JSON.parse(aiRawText);
        aiData = structuredReviewSchema.parse(jsonParsed);
      } catch (parseErr: any) {
        // JSON or Zod validation failed — mark review as FAILED
        console.error("[Review] AI response failed validation:", parseErr.message);
        await db
          .update(reviews)
          .set({ status: "FAILED", updatedAt: new Date() })
          .where(eq(reviews.id, pending.id));

        return res.status(502).json({
          error: "AI review failed",
          details: "The AI returned an invalid response. Please try again.",
        });
      }

      // 5a. Transaction: update review + bulk-insert findings
      const [completed] = await db
        .update(reviews)
        .set({
          status: "COMPLETED",
          overallSummary: aiData.summary,
          overallRisk: aiData.overallRisk,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, pending.id))
        .returning();

      // Insert findings if any exist
      let savedFindings: typeof reviewFindings.$inferSelect[] = [];
      if (aiData.findings.length > 0) {
        savedFindings = await db
          .insert(reviewFindings)
          .values(
            aiData.findings.map((f) => ({
              reviewId: pending.id,
              title: f.title,
              severity: f.severity,
              category: f.category,
              startLine: f.startLine ?? null,
              endLine: f.endLine ?? null,
              explanation: f.explanation,
              impact: f.impact ?? null,
              recommendation: f.recommendation,
              suggestedCode: f.suggestedCode ?? null,
            }))
          )
          .returning();
      }

      return res.status(201).json({ review: completed, findings: savedFindings });
    } catch (aiErr: any) {
      // 5b. AI network/quota failure
      await db
        .update(reviews)
        .set({ status: "FAILED", updatedAt: new Date() })
        .where(eq(reviews.id, pending.id));

      return res.status(502).json({
        error: "AI review failed",
        details:
          aiErr.message ||
          "An unexpected error occurred while communicating with the AI service.",
      });
    }
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─── GET /reviews ─────────────────────────────────────────────────────────────
/**
 * Return a list of all reviews for the authenticated user, newest first.
 * Only summary fields are returned (no heavy codeContent).
 */
export async function listReviews(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.session.userId!;

    const userReviews = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        language: reviews.language,
        status: reviews.status,
        overallRisk: reviews.overallRisk,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    return res.status(200).json({ reviews: userReviews });
  } catch (err) {
    console.error("listReviews error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─── GET /reviews/:id ─────────────────────────────────────────────────────────
/**
 * Return the full details of one review including all its findings.
 * Ownership is enforced — a user can only see their own reviews.
 */
export async function getReview(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.session.userId!;
    const { id } = req.params;

    // Ownership check: both id AND userId must match
    const [review] = await db
      .select()
      .from(reviews)
      .where(sql`${reviews.id} = ${id} AND ${reviews.userId} = ${userId}`)
      .limit(1);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Fetch associated findings ordered by creation (reflects code line order)
    const findings = await db
      .select()
      .from(reviewFindings)
      .where(sql`${reviewFindings.reviewId} = ${id}`)
      .orderBy(reviewFindings.createdAt);

    return res.status(200).json({ review, findings });
  } catch (err) {
    console.error("getReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─── DELETE /reviews/:id ──────────────────────────────────────────────────────
/**
 * Delete a review and all its findings (cascade handled by DB schema).
 * Ownership is enforced.
 */
export async function deleteReview(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.session.userId!;
    const { id } = req.params;

    const [deleted] = await db
      .delete(reviews)
      .where(sql`${reviews.id} = ${id} AND ${reviews.userId} = ${userId}`)
      .returning({ id: reviews.id });

    if (!deleted) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
