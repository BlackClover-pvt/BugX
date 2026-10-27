import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { reviewLimiter } from "../middleware/rateLimiter";
import {
  createReview,
  listReviews,
  getReview,
  deleteReview,
} from "../controllers/review.controller";

const router = Router();

// All /reviews routes require an active session
router.use(requireAuth);

// POST is rate-limited (15/hour per user) to protect Gemini API quota
router.post("/", reviewLimiter, createReview);  // POST   /reviews
router.get("/", listReviews);                   // GET    /reviews
router.get("/:id", getReview);                  // GET    /reviews/:id
router.delete("/:id", deleteReview);            // DELETE /reviews/:id

export default router;

