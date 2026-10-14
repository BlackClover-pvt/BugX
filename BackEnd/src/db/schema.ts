import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const reviewStatusEnum = pgEnum("review_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "PASTED",
  "FILE",
]);

export const severityEnum = pgEnum("severity", [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);

export const findingCategoryEnum = pgEnum("finding_category", [
  "CORRECTNESS",
  "SECURITY",
  "PERFORMANCE",
  "READABILITY",
  "GENERAL",
]);

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Sessions (for connect-pg-simple) ───────────────────────────────────────
// connect-pg-simple creates its own "session" table automatically,
// but we define the schema here for documentation and type safety.

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { precision: 6, withTimezone: true }).notNull(),
});

// ─── Reviews ────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  reviewFocus: text("review_focus").notNull(), // JSON array stored as text: e.g. '["correctness","security"]'
  sourceType: sourceTypeEnum("source_type").notNull().default("PASTED"),
  codeContent: text("code_content"), // nullable if user opts out of storage
  status: reviewStatusEnum("status").notNull().default("PENDING"),
  overallSummary: text("overall_summary"),
  overallRisk: riskLevelEnum("overall_risk"),
  provider: varchar("provider", { length: 50 }),
  model: varchar("model", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Review Findings ────────────────────────────────────────────────────────

export const reviewFindings = pgTable("review_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  severity: severityEnum("severity").notNull(),
  category: findingCategoryEnum("category").notNull(),
  startLine: integer("start_line"),
  endLine: integer("end_line"),
  explanation: text("explanation").notNull(),
  impact: text("impact"),
  recommendation: text("recommendation").notNull(),
  suggestedCode: text("suggested_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  findings: many(reviewFindings),
}));

export const reviewFindingsRelations = relations(reviewFindings, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewFindings.reviewId],
    references: [reviews.id],
  }),
}));
