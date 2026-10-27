# 📦 BugX — Complete Dependencies Guide

This document lists every dependency required to run both the **Backend** and **Frontend** of the BugX project through **Phase 4**, along with explanations of why each package is used and the exact commands to install them.

---

## ⚡ Quick Start: One-Line Installation

If you are cloning the repository fresh, run:

```bash
# 1. Install Backend Dependencies
cd BackEnd && npm install

# 2. Install Frontend Dependencies
cd ../FrontEnd && npm install
```

---

## 🖥️ System Prerequisites

| Prerequisite | Minimum Version | Description |
| :--- | :---: | :--- |
| **Node.js** | `>= 18.0.0` | JavaScript / TypeScript runtime environment |
| **npm** | `>= 9.0.0` | Node package manager |
| **PostgreSQL** | `>= 14.0` | Relational database (Local, Supabase, or Neon) |
| **Google Gemini Key** | Free tier API | Free API key from [Google AI Studio](https://aistudio.google.com/) |

---

## 🗄️ Backend Dependencies (`/BackEnd`)

### Production Dependencies (`dependencies`)

Installed via:
```bash
npm install @google/generative-ai argon2 connect-pg-simple cors dotenv drizzle-orm express express-session pg zod
```

| Package | Version | Category | Purpose in BugX |
| :--- | :---: | :--- | :--- |
| **`@google/generative-ai`** | `^0.21.0` | AI SDK | Official Google client to communicate with Gemini models (`gemini-flash` family) for code review generation. |
| **`argon2`** | `^0.45.1` | Security / Auth | Modern, memory-hard password hashing algorithm (Argon2id) used to hash passwords securely upon user registration and verify during login. |
| **`connect-pg-simple`** | `^10.0.0` | Session Store | PostgreSQL session store for `express-session`. Persists user login sessions across server restarts in the `session` table. |
| **`cors`** | `^2.8.5` | Networking / Middleware | Cross-Origin Resource Sharing middleware enabling safe cross-port API calls and cookie sharing between `http://localhost:5173` (Vite) and `http://localhost:3000` (Express). |
| **`dotenv`** | `^16.4.7` | Configuration | Loads environment variables from `.env` into `process.env`. |
| **`drizzle-orm`** | `^0.45.4` | Database ORM | Lightweight, type-safe TypeScript ORM used to define schemas, relations, and execute queries across `users`, `session`, `reviews`, and `review_findings`. |
| **`express`** | `^4.21.2` | Web Framework | Core HTTP server framework providing routing, JSON parsing, and middleware pipeline. |
| **`express-session`** | `^1.19.0` | Authentication | Server-side session middleware issuing signed, secure HTTP-only cookies (`connect.sid`). |
| **`pg`** | `^8.23.1` | Database Driver | PostgreSQL client and connection pooling used by both Drizzle ORM and `connect-pg-simple`. |
| **`zod`** | `^4.6.7` | Validation | Schema validation library ensuring incoming registration, login, and review payloads adhere strictly to constraints (size limits, email formats, password rules). |

---

### Development Dependencies (`devDependencies`)

Installed via:
```bash
npm install -D @types/connect-pg-simple @types/cors @types/express @types/express-session @types/node @types/pg drizzle-kit tsx typescript
```

| Package | Version | Category | Purpose in BugX |
| :--- | :---: | :--- | :--- |
| **`@types/connect-pg-simple`** | `^7.0.3` | Type Definitions | TypeScript types for `connect-pg-simple`. |
| **`@types/cors`** | `^2.8.19` | Type Definitions | TypeScript types for `cors`. |
| **`@types/express`** | `^5.0.6` | Type Definitions | TypeScript types for `express` request, response, and router objects. |
| **`@types/express-session`** | `^1.19.0` | Type Definitions | TypeScript definitions for `express-session`, including `SessionData` interface augmentation. |
| **`@types/node`** | `^26.6.5` | Type Definitions | Type definitions for Node.js standard runtime modules. |
| **`@types/pg`** | `^8.23.1` | Type Definitions | TypeScript types for PostgreSQL connection pools and clients. |
| **`drizzle-kit`** | `^0.31.11` | CLI Tool | Migration generator and database management tool (`npm run db:generate`, `npm run db:migrate`, `npm run db:studio`). |
| **`tsx`** | `^4.23.15` | Runtime Tool | Fast TypeScript execution engine and hot-reloading file watcher used during local development (`tsx watch server.js`). |
| **`typescript`** | `^7.0.2` | Compiler | Compiles TypeScript files to production JavaScript (`npm run build`). |

---

## 🎨 Frontend Dependencies (`/FrontEnd`)

### Production Dependencies (`dependencies`)

Installed via:
```bash
npm install axios highlight.js lucide-react marked prismjs react react-dom react-markdown react-simple-code-editor rehype-highlight
```

| Package | Version | Category | Purpose in BugX |
| :--- | :---: | :--- | :--- |
| **`axios`** | `^1.7.9` | HTTP Client | Promise-based HTTP client configured with `withCredentials: true` to handle automatic cookie-based authentication with Express. |
| **`highlight.js`** | `^11.11.1` | Syntax Highlighter | Provides code block syntax theme styling (`github-dark.css`) for AI review output. |
| **`lucide-react`** | `^1.57.0` | UI Icons | Clean, lightweight SVG icons (`Sparkles`, `Code2`, `Loader2`, `BotMessageSquare`, `LogOut`, `User`). |
| **`marked`** | `^15.0.6` | Markdown Utility | Low-level markdown parsing engine. |
| **`prismjs`** | `^1.29.0` | Syntax Highlighter | Real-time syntax highlighting for the interactive code input editor (`prism-tomorrow.css`). |
| **`react`** | `^19.0.0` | Core UI | React 19 UI component library. |
| **`react-dom`** | `^19.0.0` | DOM Renderer | React renderer for the web browser. |
| **`react-markdown`** | `^9.0.3` | UI Component | Renders the AI-generated code review text into rich markdown directly inside the right panel. |
| **`react-simple-code-editor`** | `^0.14.1` | Code Editor | Lightweight, editable textarea code editor component supporting line numbers and tab indentations. |
| **`rehype-highlight`** | `^7.0.2` | Markdown Plugin | Rehype plugin for `react-markdown` applying automatic code block highlighting with `highlight.js`. |

---

### Development Dependencies (`devDependencies`)

Installed via:
```bash
npm install -D @eslint/js @types/react @types/react-dom @vitejs/plugin-react eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript vite
```

| Package | Version | Category | Purpose in BugX |
| :--- | :---: | :--- | :--- |
| **`@eslint/js`** | `^9.19.0` | Linting | ESLint JavaScript core rules. |
| **`@types/react`** | `^19.0.8` | Type Definitions | TypeScript definitions for React components, hooks, and JSX. |
| **`@types/react-dom`** | `^19.0.3` | Type Definitions | TypeScript definitions for React DOM. |
| **`@vitejs/plugin-react`** | `^4.3.4` | Vite Plugin | Fast Refresh and JSX transformation plugin for Vite. |
| **`eslint`** | `^9.19.0` | Linter | Static code analysis tool identifying anti-patterns and syntax issues. |
| **`eslint-plugin-react`** | `^7.37.4` | Linting Plugin | React-specific linting rules. |
| **`eslint-plugin-react-hooks`** | `^5.0.0` | Linting Plugin | Enforces Rules of Hooks. |
| **`eslint-plugin-react-refresh`** | `^0.4.18` | Linting Plugin | Integrates Fast Refresh safety checks with ESLint. |
| **`globals`** | `^15.14.0` | Linter Config | Browser and Node global identifier definitions for ESLint. |
| **`typescript`** | `^5.9.3` | Compiler / Types | Type checker supporting JSX/TSX syntax. |
| **`vite`** | `^6.1.0` | Bundler / Dev Server | Ultra-fast development server with Hot Module Replacement (HMR) and optimized Rollup production builds. |

---

## 📅 Dependencies Introduced by Project Phase

- **Phase 1 (Project Foundation & TypeScript)**:
  - Backend: `tsx`, `typescript`, `@types/node`
  - Frontend: `vite`, `@vitejs/plugin-react`, `prismjs`, `react-simple-code-editor`
- **Phase 2 (Relational Persistence Layer & Schema)**:
  - Backend: `pg`, `drizzle-orm`, `drizzle-kit`, `@types/pg`
- **Phase 3 (End-to-End Authentication)**:
  - Backend: `argon2`, `express-session`, `connect-pg-simple`, `zod`, `cors`, `@types/express-session`, `@types/connect-pg-simple`, `@types/cors`
  - Frontend: `axios`, `lucide-react`
- **Phase 4 (Review Submission API & Persistence)**:
  - No new external packages required; builds directly on `drizzle-orm`, `zod`, `express-session`, and `axios`.

---

## 💡 Troubleshooting & Installation Notes

1. **`argon2` build error (C++ compilation)**:
   - `argon2` ships with pre-compiled prebuild binaries for most operating systems (Windows, macOS, Linux).
   - If your environment requires compiling from source, ensure you have Python 3 and a C++ compiler (`windows-build-tools` on Windows or `build-essential` on Linux).
2. **PostgreSQL SSL connection (Supabase / Neon)**:
   - `pg` uses SSL by default when connecting to cloud providers. Ensure your connection string includes `?sslmode=require` or is handled via our connection pool configuration in `BackEnd/src/db/index.ts`.
3. **Node Version Compatibility**:
   - React 19 and Vite 6 require Node.js `>= 18.0.0`. Run `node -v` to ensure you are on a supported LTS release (e.g. Node 18, 20, or 22).
