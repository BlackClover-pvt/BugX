import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";

const router = Router();

// POST /auth/register  — Create a new account
router.post("/register", register);

// POST /auth/login     — Log in with email & password
router.post("/login", login);

// POST /auth/logout    — Destroy the session
router.post("/logout", logout);

// GET  /auth/me        — Get currently logged-in user
router.get("/me", getMe);

export default router;
