# 🚀 BugX — Master Project Handover & Implementation Roadmap (Phases 5 to 11)

> **Document Purpose**: This document serves as the **single source of truth** for resuming development of **BugX** on another computer, with a fresh environment or different AI coding assistant account. It details **everything completed through Phase 4** and provides an **exhaustive blueprint for implementing Phases 5 through 11**.

---

## 📌 Table of Contents

1. [Executive Briefing & Operating Protocol](#1-executive-briefing--operating-protocol)
2. [Current Architecture & Environment State](#2-current-architecture--environment-state)
3. [Audit of Completed Work (Phases 1 to 4)](#3-audit-of-completed-work-phases-1-to-4)
4. [Complete Repository File Inventory](#4-complete-repository-file-inventory)
5. [Active Database Schema & Relationships](#5-active-database-schema--relationships)
6. [Detailed Specifications for Remaining Phases (Phases 5 to 11)](#6-detailed-specifications-for-remaining-phases-phases-5-to-11)
   - [Phase 5: LLM Provider Adapter & Structured Output](#phase-5-llm-provider-adapter--structured-output)
   - [Phase 6: Enhanced Review Submission UI](#phase-6-enhanced-review-submission-ui)
   - [Phase 7: Structured Findings UI & Code Comparison](#phase-7-structured-findings-ui--code-comparison)
   - [Phase 8: Review History Dashboard & Data Management](#phase-8-review-history-dashboard--data-management)
   - [Phase 9: Security Hardening, Rate Limiting & Reliability](#phase-9-security-hardening-rate-limiting--reliability)
   - [Phase 10: Backend & AI Mock Testing Suite](#phase-10-backend--ai-mock-testing-suite)
   - [Phase 11: Frontend Testing, E2E Verification & Polish](#phase-11-frontend-testing-e2e-verification--polish)
7. [New PC Setup Guide](#7-new-pc-setup-guide)
8. [Plug-and-Play Kickoff Prompt for the New AI Agent](#8-plug-and-play-kickoff-prompt-for-the-new-ai-agent)

---

## 1. Executive Briefing & Operating Protocol

### Project Identity
- **Name**: BugX — AI-Powered Code Reviewer
- **Mission**: A developer-focused web application where users write or paste code snippets (or upload single files), select the language and review focus (correctness, security, performance, readability, general), and receive structured, actionable AI code reviews with line numbers, severity rankings, and suggested fixes.
- **Budget / Cost Rule**: **100% Free of Cost**. Uses open-source libraries, free Supabase/Neon PostgreSQL, and Google Gemini free-tier API (`gemini-2.5-flash` / `gemini-flash-lite-latest`). Never introduce paid services or subscription tools.
- **Design Aesthetic**: Premium dark mode with vibrant indigo/violet glassmorphism, responsive panels, subtle micro-animations, and clean typography. The app must feel sleek and state-of-the-art.

### 🛡️ Critical Agent Contract (Mandatory Rules for Any Coding AI)
1. **Never make unauthorized edits**: Inspect files in read-only mode first. Propose changes clearly with exact file paths and commands, and **wait for user approval** before writing or modifying code.
2. **Work phase-by-phase**: Implement only the single approved phase. Do not jump ahead or silently expand scope.
3. **Preserve existing functionality**: Do not delete or overwrite working auth, session, or database code unless explicitly requested.
4. **Scope all review operations to the authenticated user**: Every database query for reviewing, fetching, or deleting must enforce `userId = req.session.userId`.
5. **Never trust AI provider output blindly**: Every JSON output from the LLM must be strictly validated with **Zod** before writing to the database.

---

## 2. Current Architecture & Environment State

### Technology Stack
| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Vanilla CSS (Design System), Prism.js, Lucide Icons, Axios |
| **Backend** | Node.js, Express, TypeScript (`tsx` hot-reload), Drizzle ORM, Zod, Argon2 |
| **Database** | PostgreSQL (Supabase cloud pooler or local) with Drizzle ORM & Drizzle Kit |
| **Session** | `express-session` with `connect-pg-simple` (Postgres `session` table), signed HTTP-only cookies |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) via server-side credentials |

### Current Ports & Network Topology
- **Backend API**: `http://localhost:3000`
- **Frontend App**: `http://localhost:5173`
- **CORS Configuration**: Explicit origin whitelist (`http://localhost:5173`) with `credentials: true`.

---

## 3. Audit of Completed Work (Phases 1 to 4)

### ✅ Phase 1: Project Foundation & TypeScript
- Configured backend TypeScript (`tsconfig.json`), build scripts, and `tsx watch server.js` for instant hot-reload.
- Setup environment templates (`.env.example`) and `.gitignore`.
- Set up Vite frontend with React 19 and Prism syntax highlighting.

### ✅ Phase 2: Relational Persistence Layer (Drizzle ORM)
- Defined complete PostgreSQL schema in `BackEnd/src/db/schema.ts`:
  - Enums: `review_status`, `source_type`, `severity`, `risk_level`, `finding_category`.
  - Tables: `users`, `session` (for session store), `reviews`, and `review_findings`.
  - Foreign key cascades: `onDelete: "cascade"` for reviews and findings.
- Generated and executed migrations using Drizzle Kit (`0000_burly_silvermane.sql`).
- Created shared connection pool in `BackEnd/src/db/index.ts` supporting both local and remote SSL (Supabase).

### ✅ Phase 3: End-to-End Authentication & User Workspace
- **Password Security**: Argon2id memory-hard password hashing.
- **Session Management**: Server-side sessions in PostgreSQL via `connect-pg-simple` with 12-hour expiration and secure cookies.
- **Auth Endpoints**:
  - `POST /auth/register`: Zod-validated (`displayName`, `email`, `password`), hashes password, saves user, auto-logs into session.
  - `POST /auth/login`: Verifies credentials via Argon2, establishes session.
  - `GET /auth/me`: Returns sanitized user profile `{ id, displayName, email, createdAt }`.
  - `POST /auth/logout`: Destroys server session and clears `connect.sid` cookie.
- **Frontend Auth Integration**:
  - `AuthContext.jsx`: Provides global `user`, `loading`, `login()`, `register()`, and `logout()`.
  - `AuthPage.jsx`: Full-screen glassmorphic landing view with tabbed Login/Register forms. Shows first on load if not authenticated.
  - `Navbar.jsx`: Brand logo, user avatar, display name, and logout button.
  - `App.jsx`: Auth gateway logic displaying a splash loader while checking session, rendering `AuthPage` if unauthenticated, and workspace if logged in.

### ✅ Phase 4: Review Submission API & Database Persistence
- **Review Zod Validation** (`BackEnd/src/validators/review.validator.ts`):
  - Validates `code` (1 to 10,240 chars / 10KB max limit).
  - Validates `language` (enum of 17 supported languages, defaults to `javascript`).
  - Validates optional `title` (max 200 chars).
- **Authentication Guard** (`BackEnd/src/middleware/requireAuth.ts`):
  - Reusable middleware rejecting unauthenticated requests with `401 Unauthorized`.
- **Review CRUD Controller** (`BackEnd/src/controllers/review.controller.ts`):
  - `POST /reviews`: Inserts a `PENDING` review row -> invokes Gemini AI -> updates row to `COMPLETED` with markdown summary (or `FAILED` if AI fails) -> returns review object.
  - `GET /reviews`: Lists all reviews belonging to `req.session.userId`, sorted newest first.
  - `GET /reviews/:id`: Fetches complete review + associated findings for the owner.
  - `DELETE /reviews/:id`: Deletes review and cascade-deletes findings.
- **Frontend Integration**:
  - `App.jsx` updated to call `api.post('/reviews', { code, language })`.
  - Displays a subtle `#<reviewId>` chip and `Saved` badge in the AI Feedback panel header upon completion.

---

## 4. Complete Repository File Inventory

```text
code-review-main/
├── .env.example                               # Master template for environment secrets
├── .gitignore                                 # Git ignore rules (node_modules, .env, PDFs, logs)
├── README.md                                  # Complete project documentation with phase status
├── DEPENDENCIES.md                            # Comprehensive dependency catalog with versioning
├── PROJECT_HANDOVER_PHASES_5_TO_11.md         # THIS HANDOVER DOCUMENT
│
├── BackEnd/
│   ├── .env.example                           # Backend-specific environment variables template
│   ├── drizzle.config.ts                      # Drizzle Kit configuration pointing to schema
│   ├── package.json                           # Dependencies & run scripts (dev, db:migrate, etc.)
│   ├── tsconfig.json                          # Backend TypeScript compiler settings
│   ├── server.js                              # Server bootstrap (imports src/app.js, listens on 3000)
│   ├── drizzle/
│   │   └── 0000_burly_silvermane.sql          # Base PostgreSQL migration file
│   └── src/
│       ├── app.js                             # Express application, CORS, session, and route mounts
│       ├── controllers/
│       │   ├── auth.controller.ts             # register, login, logout, getMe handlers
│       │   ├── review.controller.ts           # createReview, listReviews, getReview, deleteReview
│       │   └── ai.controller.js               # Legacy stateless getReview handler
│       ├── db/
│       │   ├── index.ts                       # pg.Pool and Drizzle db client initialization
│       │   └── schema.ts                      # Relational schema (users, session, reviews, findings)
│       ├── middleware/
│       │   ├── requireAuth.ts                 # Session gate middleware (returns 401 if not logged in)
│       │   └── session.ts                     # express-session + connect-pg-simple store configuration
│       ├── routes/
│       │   ├── auth.routes.ts                 # /auth endpoints router
│       │   ├── review.routes.ts               # /reviews endpoints router (gated by requireAuth)
│       │   └── ai.routes.js                   # Legacy /ai router
│       ├── services/
│       │   └── ai.service.js                  # Gemini AI caller with model fallback chain
│       └── validators/
│           ├── auth.validator.ts              # Zod schemas for register and login
│           └── review.validator.ts            # Zod schemas for review submission (10KB limit)
│
└── FrontEnd/
    ├── index.html                             # HTML entry point with title and viewport
    ├── package.json                           # Frontend dependencies & scripts
    ├── vite.config.js                         # Vite config with React plugin and proxy settings
    └── src/
        ├── api.js                             # Centralized Axios client (withCredentials: true)
        ├── App.jsx                            # Root component: auth gateway + code review workspace
        ├── App.css                            # Dual-panel layout, badges, editor, and review styles
        ├── components/
        │   ├── AuthPage.jsx                   # Primary Login / Register landing view
        │   ├── AuthPage.css                   # Glassmorphic dark styling for AuthPage
        │   ├── Navbar.jsx                     # Top navigation with user status and logout
        │   └── Navbar.css                     # Navbar header styling
        └── context/
            └── AuthContext.jsx                # React Context for authentication state
```

---

## 5. Active Database Schema & Relationships

Defined in `BackEnd/src/db/schema.ts` and managed via Drizzle ORM:

```mermaid
erDiagram
    users ||--o{ reviews : "has many"
    reviews ||--o{ review_findings : "has many (cascade delete)"
    
    users {
        uuid id PK
        varchar display_name
        varchar email UK
        text password_hash
        timestamp created_at
    }

    session {
        varchar sid PK
        text sess
        timestamp expire
    }

    reviews {
        uuid id PK
        uuid user_id FK
        varchar title
        varchar language
        text review_focus
        enum source_type "PASTED | FILE"
        text code_content
        enum status "PENDING | COMPLETED | FAILED"
        text overall_summary
        enum overall_risk "CRITICAL | HIGH | MEDIUM | LOW"
        varchar provider
        varchar model
        timestamp created_at
        timestamp updated_at
    }

    review_findings {
        uuid id PK
        uuid review_id FK
        varchar title
        enum severity "CRITICAL | HIGH | MEDIUM | LOW | INFO"
        enum category "CORRECTNESS | SECURITY | PERFORMANCE | READABILITY | GENERAL"
        int start_line
        int end_line
        text explanation
        text impact
        text recommendation
        text suggested_code
        timestamp created_at
    }
```

---

## 6. Detailed Specifications for Remaining Phases (Phases 5 to 11)

### Phase 5: LLM Provider Adapter & Structured Output
*Transform AI reviews from unformatted markdown into strictly validated, typed JSON rows in the database.*

#### 🎯 Objectives
1. Configure Gemini to return strictly valid JSON conforming to an exact schema (`responseMimeType: "application/json"`).
2. Validate the AI response with Zod before touching the database.
3. Save structured findings as discrete rows in the `review_findings` table in the same database transaction as the `reviews` record update.
4. Maintain a robust fallback model chain (`gemini-2.5-flash` -> `gemini-flash-lite-latest` -> `gemini-flash-latest`).

#### 🛠️ Files to Create / Modify
- **Create** `BackEnd/src/validators/aiResponse.validator.ts`:
  ```typescript
  import { z } from "zod";

  export const findingSchema = z.object({
    title: z.string().min(1).max(300),
    severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]),
    category: z.enum(["CORRECTNESS", "SECURITY", "PERFORMANCE", "READABILITY", "GENERAL"]),
    startLine: z.number().int().positive().nullable().optional(),
    endLine: z.number().int().positive().nullable().optional(),
    explanation: z.string().min(1),
    impact: z.string().nullable().optional(),
    recommendation: z.string().min(1),
    suggestedCode: z.string().nullable().optional(),
  });

  export const structuredReviewSchema = z.object({
    summary: z.string().min(1),
    overallRisk: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    findings: z.array(findingSchema),
  });

  export type StructuredReview = z.infer<typeof structuredReviewSchema>;
  ```
- **Modify** `BackEnd/src/services/ai.service.js` (or convert to `.ts`):
  - Pass system instruction commanding JSON-only output.
  - Instruct the model never to fabricate line numbers (set `null` if uncertain).
  - Use `generationConfig: { responseMimeType: "application/json" }`.
- **Modify** `BackEnd/src/controllers/review.controller.ts`:
  - Parse AI response using `structuredReviewSchema.parse(JSON.parse(aiRawText))`.
  - In a transaction, update `reviews` row (`overallSummary = data.summary`, `overallRisk = data.overallRisk`, `status = 'COMPLETED'`) and insert all items from `data.findings` into `review_findings`.
  - If JSON parsing or Zod fails, update `status = 'FAILED'` without crashing.

---

### Phase 6: Enhanced Review Submission UI
*Upgrade the code input experience with language selection, review focus toggles, file upload, and byte limit counter.*

#### 🎯 Objectives
1. **Language Selector Dropdown**: JavaScript, TypeScript, Python, Java, C++, Go, Rust, SQL, HTML/CSS, etc.
2. **Review Focus Multi-Select Chips**: Correctness, Security, Performance, Readability, General.
3. **Single File Upload**: Drag-and-drop or file picker that reads `.js`, `.ts`, `.py`, `.java`, etc. into the editor.
4. **Code Size Counter**: Live counter showing e.g., `1,240 / 10,240 bytes (12%)` with visual color changes (green -> amber -> red).
5. **External Provider Notice**: Transparent banner informing users that code is sent to Google Gemini for processing.

#### 🛠️ Files to Create / Modify
- **Create** `FrontEnd/src/components/SubmissionControls.jsx` & `.css`:
  - Houses the language selector, review focus checkboxes, and file upload trigger.
- **Modify** `FrontEnd/src/App.jsx`:
  - State management for `selectedLanguage`, `selectedFocus`, and file reading logic via `FileReader API`.
  - Pass `language` and `reviewFocus` in the POST request to `/reviews`.
- **Modify** `BackEnd/src/validators/review.validator.ts`:
  - Accept `reviewFocus` as an array of valid category strings.

---

### Phase 7: Structured Findings UI & Code Comparison
*Replace the single markdown text container with rich, interactive finding cards.*

#### 🎯 Objectives
1. **Overall Risk Indicator**: Color-coded risk meter at the top of the findings panel (Critical = Red, High = Orange, Medium = Yellow, Low = Green).
2. **Finding Cards**:
   - Severity badge (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
   - Category pill (`SECURITY`, `CORRECTNESS`, etc.).
   - Line reference badge (e.g., `Lines 14-22`).
   - Accordion/collapsible explanation, impact, and recommendation.
3. **Suggested Code Diff Block**:
   - Clean syntax-highlighted display of `suggestedCode` with a one-click "Copy Code" button.
4. **Empty / No-Findings State**:
   - Clean state when AI detects zero issues: "🎉 Clean code! No critical issues or security defects identified."

#### 🛠️ Files to Create / Modify
- **Create** `FrontEnd/src/components/FindingCard.jsx` & `.css`:
  - Individual finding card with severity badge, line tag, explanation, and copyable snippet.
- **Create** `FrontEnd/src/components/RiskMeter.jsx`:
  - Overall risk header component.
- **Modify** `FrontEnd/src/App.jsx`:
  - Map over `findings` array returned from `/reviews` instead of rendering raw markdown text.

---

### Phase 8: Review History Dashboard & Data Management
*Empower users to view, reopen, search, and delete past reviews with strict data privacy.*

#### 🎯 Objectives
1. **History Modal or Dashboard Drawer**:
   - Replaces or supplements the review panel with a list of previous reviews.
   - Shows: Title, Language, Date, Overall Risk badge, and Finding count.
2. **Reopen Review**:
   - Clicking a past review calls `GET /reviews/:id` and populates both the editor (with the saved code) and the findings panel (with the saved findings).
3. **Delete Review with Confirmation**:
   - Clicking delete opens a confirmation modal -> calls `DELETE /reviews/:id` -> removes review and cascades deletion of findings from PostgreSQL.
4. **Ownership Security**:
   - Fully enforced in backend (User A cannot access or delete User B's review even if ID is known).

#### 🛠️ Files to Create / Modify
- **Create** `FrontEnd/src/components/HistoryDrawer.jsx` & `.css`:
  - Slide-out or modal list showing past reviews fetched from `GET /reviews`.
- **Create** `FrontEnd/src/components/DeleteConfirmModal.jsx`:
  - Safe confirmation modal before destructive deletion.
- **Modify** `FrontEnd/src/components/Navbar.jsx`:
  - Add a "History" button with an icon to toggle the history drawer.

---

### Phase 9: Security Hardening, Rate Limiting & Reliability
*Harden the system against abuse, denial-of-service, and data leakage.*

#### 🎯 Objectives
1. **Rate Limiting**:
   - Install `express-rate-limit`.
   - Protect `/auth/login` and `/auth/register` (e.g. max 10 requests per 15 minutes per IP).
   - Protect `/reviews` creation (e.g. max 15 reviews per hour per user) to conserve Gemini quotas.
2. **Prompt Injection Defense**:
   - Update Gemini system instructions: explicitly treat user code as **untrusted data**, not instructions. Block prompt-injection attempts inside code comments.
3. **Safe Error Masking**:
   - Centralized error handler in Express. Ensure internal server errors return generic messages without leaking SQL syntax, stack traces, or Gemini API keys.
4. **Cookie Hardening**:
   - Verify `sameSite: "lax"`, `httpOnly: true`, and `secure: process.env.NODE_ENV === "production"`.

#### 🛠️ Files to Create / Modify
- **Modify** `BackEnd/package.json`: Add `express-rate-limit`.
- **Create** `BackEnd/src/middleware/rateLimiter.ts`: Auth limiter and review limiter.
- **Modify** `BackEnd/src/app.js`: Mount rate limiters and centralized error handling middleware.

---

### Phase 10: Backend & AI Mock Testing Suite
*Establish automated unit and API integration tests.*

#### 🎯 Objectives
1. Set up **Vitest** + **Supertest** in `BackEnd/`.
2. Test Cases:
   - **Auth Suite**: Register duplicate email rejection, invalid password rejection, login success/failure, logout session destruction.
   - **Review Validation Suite**: Code exceeding 10KB rejected, unsupported language rejected, missing code rejected.
   - **AI Mock Suite**: Mock `@google/generative-ai` to test successful structured parsing, malformed JSON recovery, and network timeout handling.
   - **Authorization Suite**: Verify User A cannot access or delete User B's review (returns 404).

#### 🛠️ Files to Create
- `BackEnd/vitest.config.ts`
- `BackEnd/src/__tests__/auth.test.ts`
- `BackEnd/src/__tests__/review.test.ts`
- `BackEnd/src/__tests__/validator.test.ts`

---

### Phase 11: Frontend Testing, E2E Verification & Polish
*Verify the complete user journey and polish the user experience.*

#### 🎯 Objectives
1. **End-to-End Smoke Test**:
   - Complete workflow: Register new account -> Login -> Paste code -> Choose language & focus -> Submit review -> Inspect structured findings -> Open History -> Verify review exists -> Delete review -> Logout.
2. **UI Polishing**:
   - Responsive design verification across mobile, tablet, and desktop viewports.
   - Keyboard accessibility (Esc to close modals, Tab navigation in forms).
   - Loading skeleton animations for finding cards.

---

## 7. New PC Setup Guide

When moving to the new machine:

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-github-repo-url>
cd code-review-main

# Install Backend dependencies
cd BackEnd
npm install

# Install Frontend dependencies
cd ../FrontEnd
npm install
```

### 2. Configure Environment Variables
Inside `BackEnd/`, create your `.env` file (copy from `.env.example`):
```env
PORT=3000
NODE_ENV=development
GOOGLE_GEMINI_KEY=your_actual_gemini_key_here
DATABASE_URL=postgresql://postgres:your_db_password@your_supabase_pooler:5432/postgres
SESSION_SECRET=a_random_32_character_string_here
CLIENT_URL=http://localhost:5173
```

### 3. Verify Database
Migrations are already generated in `BackEnd/drizzle/`. Simply apply them:
```bash
cd BackEnd
npm run db:migrate
```

### 4. Start Development Servers
- **Terminal 1**: `cd BackEnd && npm run dev` (starts on port 3000)
- **Terminal 2**: `cd FrontEnd && npm run dev` (starts on port 5173)

---

## 8. Plug-and-Play Kickoff Prompt for the New AI Agent

When you start a session with a new AI assistant on the other PC, copy and paste this exact prompt:

```markdown
I am continuing development on "BugX — AI-Powered Code Reviewer".
Please read the handover document at: PROJECT_HANDOVER_PHASES_5_TO_11.md

Here is the current state of the project:
- Phases 1 to 4 are COMPLETED, TESTED, and WORKING.
- Backend: Express + TypeScript + Drizzle ORM + PostgreSQL + Argon2 + express-session + connect-pg-simple.
- Frontend: React 19 + Vite + Prism.js + Axios (withCredentials: true).
- Working features: User Registration, Login, Persistent Sessions, AuthPage, Navbar, Code Input Editor, and Review Submission with database persistence to PostgreSQL.

I want to implement PHASE 5: "LLM Provider Adapter & Structured Output".
Before writing or editing any code:
1. Follow the Agent Protocol in PROJECT_HANDOVER_PHASES_5_TO_11.md.
2. Inspect the current BackEnd/src/services/ai.service.js, BackEnd/src/controllers/review.controller.ts, and BackEnd/src/db/schema.ts.
3. Present your exact implementation plan for Phase 5 (schemas, files to change, and verification steps).
4. Ask for my explicit approval before making any changes.
```
