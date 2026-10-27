# 🐞 BugX — AI-Powered Intelligent Code Review Platform

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/BlackClover-pvt/BugX?style=for-the-badge&logo=github&color=6366f1)](https://github.com/BlackClover-pvt/BugX/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/BlackClover-pvt/BugX?style=for-the-badge&logo=github&color=8b5cf6)](https://github.com/BlackClover-pvt/BugX/network/members)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge&color=3b82f6)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge&color=10b981)](CONTRIBUTING.md)

**A high-performance, full-stack automated code review workspace powered by Google Gemini, TypeScript, Express, PostgreSQL, and React.**

[Key Features](#-key-features) • [Architecture](#-architecture--data-flow) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start-guide) • [API Reference](#-api-reference) • [Testing](#-testing--quality-assurance)

</div>

---

## 📖 Overview

**BugX** is an enterprise-grade automated code review platform designed to catch subtle bugs, security vulnerabilities (OWASP Top 10), performance bottlenecks, and style antipatterns before code reaches production. 

Developers paste code snippets or upload source files, choose target review focuses (*Correctness, Security, Performance, Readability, or General*), and receive an instant, multi-dimensional assessment with categorized findings, exact line indicators, composite risk scoring, and drop-in code fixes.

### 💡 Core Design Philosophy
- **100% Free & Open-Source Stack**: Leverages Google Gemini free-tier AI (`gemini-2.5-flash`), Supabase/Neon free-tier PostgreSQL, and modern open-source tooling without third-party SaaS lock-in.
- **Defensive Engineering**: Every LLM response is strictly validated against a compile-time **Zod** schema before entering database persistence, preventing hallucinations or malformed JSON from reaching clients.
- **Zero-Trust Security**: Multi-tier authentication using **Argon2id** password hashing, HTTP-only server-side session cookies backed by PostgreSQL, and multi-window rate-limiting.
- **Glassmorphic Developer Experience**: Fast, responsive dark-mode workspace crafted with Vanilla CSS and micro-interactions, avoiding heavy CSS utility bloat.

---

## ✨ Key Features

### 🔍 Multi-Dimensional AI Code Inspection
- **Configurable Review Focus**: Tailor the AI review prompt to specific concerns: *General Audit*, *Security Vulnerabilities*, *Performance Optimizations*, *Correctness & Logic Bugs*, or *Readability & Clean Code*.
- **Multi-Language Support**: Seamlessly analyzes JavaScript, TypeScript, Python, Go, Rust, Java, C++, PHP, SQL, HTML/CSS, and Shell scripts.
- **Actionable Structured Findings**: Findings are ranked by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`) with associated line numbers, root cause explanations, and ready-to-use code solutions.

### 📊 Dynamic Risk Meter & Quality Score
- Calculates an instant composite risk score (0 to 100%) based on finding severity density.
- Visual risk status badge (*Clean, Low Risk, Moderate Risk, Elevated Risk, Critical Risk*) for rapid triage.

### 🔐 Robust User Authentication & Session Security
- **Argon2id Hashing**: State-of-the-art password derivation resisting GPU cracking attacks.
- **Stateful PostgreSQL Sessions**: Managed via `express-session` with `connect-pg-simple` store, eliminating JWT revocation hazards.
- **Strict Cookie Configuration**: `httpOnly`, `sameSite: lax`, and conditional `secure` cookies with automatic CSRF/CORS credential isolation.

### 📜 Persistent Review History Dashboard
- **User-Scoped Isolation**: Every review is tied to the authenticated user ID and strictly protected at the database query level.
- **Historical Inspection**: Slide-out history drawer to review, inspect findings, or reload past submissions.
- **Cascade Deletion**: Safely wipe review sessions and associated finding records with modal confirmation safeguards.

### 🛡️ Production Rate Limiting & Reliability
- Tiered IP and user rate limiters guarding AI submission endpoints against DDoS, token drainage, and brute-force abuse.
- Graceful error recovery: Automatic fallbacks and structured JSON repair for intermittent provider anomalies.

---

## 🏗 Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React 19 + Vite)                     │
│  ┌──────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │  SubmissionControls  │  │     RiskMeter     │  │   FindingCards  │ │
│  └──────────┬───────────┘  └─────────▲─────────┘  └────────▲────────┘ │
│             │ Axios (Credentials)    │                     │          │
└─────────────┼────────────────────────┼─────────────────────┼──────────┘
              │ POST /reviews          │ Reviews & Findings  │
              ▼                        │                     │
┌──────────────────────────────────────┴─────────────────────┴──────────┐
│                         Backend (Express + TypeScript)                 │
│  ┌────────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │   Rate Limiting    │─▶│ Session Auth MW  │─▶│ Review Controller │  │
│  │ (Tiered IP Limiter)│  │  (requireAuth)   │  │   & Validator     │  │
│  └────────────────────┘  └──────────────────┘  └─────────┬─────────┘  │
│                                                          │            │
│                 ┌────────────────────────────────────────┼──────────┐ │
│                 │                                        ▼          │ │
│                 │                             ┌──────────────────┐  │ │
│                 │                             │ Gemini AI Service│  │ │
│                 │                             │ (Structured Mode)│  │ │
│                 │                             └──────────┬───────┘  │ │
│                 ▼                                        │          │ │
│     ┌──────────────────────┐                  ┌──────────▼───────┐  │ │
│     │   PostgreSQL DB      │◀─────────────────│  Zod Schema      │  │ │
│     │ (Drizzle ORM Tables) │  Persist Review  │  Validation      │  │ │
│     └──────────────────────┘  & Findings      └──────────────────┘  │ │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology | Key Capabilities & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Component architecture, unified state management, custom context |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Sub-second HMR, optimized ES modules bundle generation |
| **Styling & UI** | Vanilla CSS Design System | Custom dark theme, glassmorphism, responsive split-pane layout |
| **Syntax Highlighting** | [Prism.js](https://prismjs.com/) | Real-time syntax coloring for multiple programming languages |
| **Backend Runtime** | [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/) | Type-safe backend application with `tsx` development execution |
| **Server Framework** | [Express.js 4](https://expressjs.com/) | RESTful routing, modular controller layers, robust middleware pipelines |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) & [Drizzle ORM](https://orm.drizzle.team/) | Type-safe schema definition, relations, automated SQL migrations |
| **Database Driver** | [postgres.js](https://github.com/porsager/postgres) | High-performance, lightweight PostgreSQL connection client |
| **Authentication** | [Argon2](https://github.com/ranisalt/node-argon2) & [express-session](https://github.com/expressjs/session) | Cryptographic password hashing and server-side session persistence |
| **AI Intelligence** | [Google Gen AI SDK](https://github.com/google/generative-ai-js) | `gemini-2.5-flash` model invocation with structured system prompts |
| **Schema Validation** | [Zod](https://zod.dev/) | Strict runtime data contracts for HTTP payloads and AI outputs |
| **Rate Limiting** | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Anti-abuse protection, IP window limiting, burst containment |
| **Testing** | [Vitest](https://vitest.dev/) | Lightning-fast unit and integration testing suite |

---

## 📂 Project Structure

```
BugX/
├── .env.example                            # Root environment variable template
├── .gitignore                              # Git exclusion rules (node_modules, .env, dist)
├── DEPENDENCIES.md                         # Detailed architectural dependency audit
├── README.md                               # Primary public documentation
│
├── BackEnd/                                # Node.js / Express TypeScript Server
│   ├── drizzle/                            # Generated SQL migration history & schema snapshots
│   │   ├── 0000_burly_silvermane.sql
│   │   └── meta/
│   ├── src/
│   │   ├── __tests__/                      # Automated Vitest test suite
│   │   │   ├── auth.test.ts                # Authentication endpoint & password hashing tests
│   │   │   ├── review.test.ts              # Code review creation & retrieval tests
│   │   │   └── validator.test.ts           # Zod schema validation & payload boundary tests
│   │   ├── controllers/
│   │   │   ├── ai.controller.js            # Stateless legacy AI endpoint handler
│   │   │   ├── auth.controller.ts          # Register, login, session profile & logout handlers
│   │   │   └── review.controller.ts        # User-scoped review CRUD & persistence controllers
│   │   ├── db/
│   │   │   ├── index.ts                    # PostgreSQL pool connection instance via Drizzle
│   │   │   └── schema.ts                   # Relational tables: users, sessions, reviews, findings
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts              # Tiered IP rate limiting rules
│   │   │   ├── requireAuth.ts              # Route guard enforcing active user session
│   │   │   └── session.ts                  # PostgreSQL session middleware configuration
│   │   ├── routes/
│   │   │   ├── ai.routes.js                # Direct prompt testing endpoints
│   │   │   ├── auth.routes.ts              # Public & authenticated auth routes
│   │   │   └── review.routes.ts            # RESTful review management endpoints
│   │   ├── services/
│   │   │   └── ai.service.ts               # Gemini AI prompt orchestration & model wrapper
│   │   ├── validators/
│   │   │   ├── aiResponse.validator.ts     # Zod schema enforcing AI JSON output integrity
│   │   │   ├── auth.validator.ts           # Registration & login payload validators
│   │   │   └── review.validator.ts         # Code submission & parameter validators
│   │   └── app.ts                          # Express application configuration & middleware setup
│   ├── drizzle.config.ts                   # Drizzle Kit migration configuration
│   ├── package.json                        # Backend scripts & dependency declarations
│   ├── server.js                           # Server bootstrap & port listener
│   ├── tsconfig.json                       # Backend TypeScript compilation options
│   └── vitest.config.ts                    # Vitest configuration
│
└── Frontend/                               # React 19 / Vite Single Page Application
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── AuthModal.jsx               # Quick login/register dialog modal
    │   │   ├── AuthPage.jsx                # Dedicated authentication landing page
    │   │   ├── DeleteConfirmModal.jsx      # Safe deletion confirmation modal
    │   │   ├── FindingCard.jsx             # Categorized finding card with code solutions
    │   │   ├── HistoryDrawer.jsx           # Slide-out review history drawer
    │   │   ├── Navbar.jsx                  # Header navigation & user status bar
    │   │   ├── RiskMeter.jsx               # Visual composite risk meter & score component
    │   │   └── SubmissionControls.jsx      # Code input, language picker & focus selector
    │   ├── context/
    │   │   └── AuthContext.jsx             # React auth provider & session state hook (useAuth)
    │   ├── api.js                          # Pre-configured Axios instance (withCredentials: true)
    │   ├── App.css                         # Layout grid, panels & workspace design system
    │   ├── App.jsx                         # Main app routing, review state & workspace logic
    │   ├── index.css                       # Global CSS variables, reset & typography
    │   └── main.jsx                        # React root entry point
    ├── index.html                          # HTML shell
    ├── package.json                        # Frontend dependencies & build scripts
    ├── tsconfig.json                       # Frontend TypeScript definitions
    └── vite.config.js                      # Vite server & build configurations
```

---

## 🚀 Quick Start Guide

Follow these steps to run BugX locally in under 5 minutes.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: A running local PostgreSQL instance **OR** a free cloud database ([Supabase](https://supabase.com/) / [Neon](https://neon.tech/))
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/BlackClover-pvt/BugX.git
cd BugX
```

---

### Step 2: Configure Environment Variables

Create your backend configuration by copying the root template:

```bash
# On Windows (PowerShell)
Copy-Item .env.example -Destination BackEnd\.env

# On Linux / macOS
cp .env.example BackEnd/.env
```

Open `BackEnd/.env` and supply your actual credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GOOGLE_GEMINI_KEY=your_actual_gemini_api_key_here

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bugx_db

# Session Secret (Generate any random 32+ char string)
SESSION_SECRET=super_secret_session_key_min_32_characters_long

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Setup & Run the Backend

1. Navigate to `BackEnd/` and install dependencies:
   ```bash
   cd BackEnd
   npm install
   ```

2. Run Drizzle database migrations to create all tables (`users`, `session`, `reviews`, `review_findings`):
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   *(Optional)* To inspect database records visually in your browser:
   ```bash
   npm run db:studio
   ```

3. Start the backend development server with hot-reloading:
   ```bash
   npm run dev
   ```
   *The backend will boot up at **`http://localhost:3000`**.*

---

### Step 4: Setup & Run the Frontend

In a separate terminal window:

1. Navigate to `Frontend/`:
   ```bash
   cd Frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open **`http://localhost:5173`** in your browser.

---

## 📡 API Reference

### 🔐 Authentication Endpoints (`/auth`)

| Method | Endpoint | Auth | Description | Request Body Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/auth/register` | Public | Create new developer account | `{ "displayName": "Alex", "email": "alex@dev.com", "password": "securePassword123" }` |
| `POST` | `/auth/login` | Public | Authenticate session | `{ "email": "alex@dev.com", "password": "securePassword123" }` |
| `GET` | `/auth/me` | Session | Fetch authenticated profile | *None (Cookie session)* |
| `POST` | `/auth/logout` | Session | Destroy session & invalidate cookie | *None* |

---

### 📝 Code Review Endpoints (`/reviews`)

All `/reviews` endpoints are guarded by `requireAuth` middleware and scoped to the logged-in user.

| Method | Endpoint | Auth | Description | Parameters / Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/reviews` | Session | Submit code for Gemini AI review & persistence | `{ "code": "...", "language": "javascript", "focus": "security", "title": "Auth Middleware" }` |
| `GET` | `/reviews` | Session | List recent reviews belonging to user | *None (Query params: `?page=1&limit=20`)* |
| `GET` | `/reviews/:id` | Session | Fetch full review details & structured findings | `:id` (UUID) |
| `DELETE` | `/reviews/:id` | Session | Cascade delete review and all associated findings | `:id` (UUID) |

---

### ⚡ Direct AI Endpoint (`/ai`)

| Method | Endpoint | Auth | Description | Request Body Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/ai/get-review` | Public | Direct stateless code review | `{ "code": "function calculate() { ... }" }` |

---

## 🧪 Testing & Quality Assurance

BugX includes an automated test suite powered by **Vitest**, covering authentication flows, review lifecycle persistence, and Zod validation boundary conditions.

To execute the test suite:

```bash
cd BackEnd
npm test
```

To run tests with code coverage reporting:

```bash
npm run test:coverage
```

---

## 🛠 Available Scripts

### Backend (`BackEnd/`)
- `npm run dev` — Starts backend server in watch mode using `tsx`.
- `npm run build` — Compiles TypeScript to JavaScript in `dist/`.
- `npm start` — Executes production bundle.
- `npm test` — Runs automated Vitest suite.
- `npm run db:generate` — Generates SQL migration files from Drizzle schema.
- `npm run db:migrate` — Applies pending SQL migrations to PostgreSQL.
- `npm run db:studio` — Launches Drizzle Studio database visualizer.

### Frontend (`Frontend/`)
- `npm run dev` — Boots Vite development server with Hot Module Replacement.
- `npm run build` — Generates optimized production build.
- `npm run preview` — Locally previews production distribution.
- `npm run lint` — Runs ESLint code quality checks.

---

## 🤝 Contributing

Contributions to BugX are warmly welcomed! To contribute:

1. **Fork** the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingNewFeature
   ```
3. Commit your changes with a conventional commit message:
   ```bash
   git commit -m "feat: add syntax tree parsing for Go and Rust"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/AmazingNewFeature
   ```
5. Open a **Pull Request** detailing your modifications.

---

## 📄 License

This project is open-source and distributed under the **[ISC License](LICENSE)**.

---

<div align="center">

Built with ❤️ by [BlackClover-pvt](https://github.com/BlackClover-pvt)

</div>
