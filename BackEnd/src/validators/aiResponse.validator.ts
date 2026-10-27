import { z } from "zod";

// ─── Individual Finding Schema ────────────────────────────────────────────────

export const findingSchema = z.object({
  title: z.string().min(1).max(300),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]),
  category: z.enum([
    "CORRECTNESS",
    "SECURITY",
    "PERFORMANCE",
    "READABILITY",
    "GENERAL",
  ]),
  startLine: z.number().int().positive().nullable().optional(),
  endLine: z.number().int().positive().nullable().optional(),
  explanation: z.string().min(1),
  impact: z.string().nullable().optional(),
  recommendation: z.string().min(1),
  suggestedCode: z.string().nullable().optional(),
});

// ─── Full Structured Review Response Schema ───────────────────────────────────

export const structuredReviewSchema = z.object({
  summary: z.string().min(1),
  overallRisk: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  findings: z.array(findingSchema),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Finding = z.infer<typeof findingSchema>;
export type StructuredReview = z.infer<typeof structuredReviewSchema>;
