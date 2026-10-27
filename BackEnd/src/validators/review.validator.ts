import { z } from "zod";

// ─── Supported Languages ─────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "other",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ─── Review Focus Categories ─────────────────────────────────────────────────

export const REVIEW_FOCUS_OPTIONS = [
  "CORRECTNESS",
  "SECURITY",
  "PERFORMANCE",
  "READABILITY",
  "GENERAL",
] as const;

export type ReviewFocus = (typeof REVIEW_FOCUS_OPTIONS)[number];

// ─── Review Submission Schema ────────────────────────────────────────────────

export const createReviewSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10_240, "Code must not exceed 10 KB (10,240 characters)"),

  language: z
    .enum(SUPPORTED_LANGUAGES)
    .optional()
    .default("javascript"),

  title: z
    .string()
    .max(200, "Title must be at most 200 characters")
    .optional(),

  reviewFocus: z
    .array(z.enum(REVIEW_FOCUS_OPTIONS))
    .min(1, "At least one review focus must be selected")
    .optional()
    .default(["GENERAL"]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
