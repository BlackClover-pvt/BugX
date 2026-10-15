# 🐞 BugX — AI-Powered Code Reviewer

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)](https://orm.drizzle.team/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)

**BugX** is a modern, developer-focused web application designed to elevate code quality through real-time AI code reviews. Write or paste code in an interactive code editor, and receive immediate, actionable feedback covering bug detection, security best practices, and performance optimizations.

---

## ✨ Features

- 🔐 **Full Authentication System**: Session-based authentication powered by `express-session`, `connect-pg-simple`, and `argon2` password hashing.
- 🎨 **Clean & Sleek Dark UI**: Modern glassmorphic interface with ambient glow effects, responsive tabbed authentication, and smooth transitions.
- ⚡ **Interactive Code Editor**: Syntax-highlighted in-browser code editor using Prism.js.
- 🤖 **AI-Powered Code Analysis**: Powered by Google Gemini (`gemini-2.5-flash`), delivering markdown-formatted code reviews, issue breakdowns, and refactoring tips.
- 🛡️ **Type-Safe Database Schema**: PostgreSQL integrated with Drizzle ORM for streamlined migrations and type-safety.
- 👤 **Session Persistence**: Automatic session restoration on page refresh with secure HTTP-only cookies.

---

## 🏗️ Architecture & Tech Stack

### **Frontend** (`/FrontEnd`)
- **Core**: React 19, Vite
- **Styling**: Vanilla CSS (modular design system, dark mode glassmorphism)
- **Editor**: `react-simple-code-editor` + `prismjs`
- **Markdown & Highlight**: `react-markdown` + `rehype-highlight` + `highlight.js`
- **Icons**: `lucide-react`
- **HTTP Client**: `axios` (configured with `withCredentials: true`)

### **Backend** (`/BackEnd`)
- **Runtime & Framework**: Node.js, Express, `tsx`
- **AI Engine**: `@google/generative-ai` (Google Gemini API)
- **Database**: PostgreSQL (Local or Supabase / Neon)
- **ORM & Migrations**: Drizzle ORM (`drizzle-kit`)
- **Authentication**: `express-session`, `connect-pg-simple` (Postgres session store), `argon2`
- **Validation**: Zod schema validation
- **Security**: CORS, secure cookie policies, parameterized SQL queries

---

## 📁 Repository Structure

```text
code-review-main/
├── .env.example              # Example environment variables template
├── README.md                 # Project documentation
├── BackEnd/
│   ├── .env.example          # Backend-specific environment template
│   ├── drizzle.config.ts     # Drizzle Kit configuration
│   ├── package.json          # Backend dependencies and scripts
│   ├── server.js             # Server entry point
│   ├── src/
│   │   ├── app.js            # Express app configuration & middleware
│   │   ├── controllers/      # Route controllers (auth, etc.)
│   │   ├── db/               # Drizzle database client & schema definitions
│   │   ├── middleware/       # Session & authentication middlewares
│   │   ├── routes/           # Express routes (ai.routes, auth.routes)
│   │   ├── services/         # Gemini AI review service
│   │   └── validators/       # Zod validation schemas
│   └── drizzle/              # Generated SQL migrations
└── FrontEnd/
    ├── package.json          # Frontend dependencies and scripts
    ├── vite.config.js        # Vite configuration
    ├── index.html            # HTML entry template
    └── src/
        ├── api.js            # Pre-configured Axios instance
        ├── App.jsx           # Main application routing and workspace
        ├── App.css           # Workspace & layout styles
        ├── components/
        │   ├── AuthPage.jsx  # Primary Login / Register landing view
        │   ├── AuthPage.css  # AuthPage styles
        │   ├── Navbar.jsx    # Top navigation & user profile
        │   ├── Navbar.css    # Navbar styles
        │   ├── AuthModal.jsx # Modal-based auth component
        │   └── AuthModal.css # AuthModal styles
        └── context/
            └── AuthContext.jsx # Global auth state provider (useAuth)
```

---

## 🚀 Getting Started

Follow these instructions to clone and run BugX locally on your machine.

### Prerequisites

- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**:
  - Local PostgreSQL instance (e.g. via Postgres.app, Docker, or installer), OR
  - Free cloud PostgreSQL database ([Supabase](https://supabase.com/) or [Neon](https://neon.tech/))
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/code-review.git
cd code-review
```

---

### Step 2: Configure Environment Variables

Create your `.env` file in the `BackEnd/` directory by copying the provided example:

```bash
# On Linux / macOS
cp .env.example BackEnd/.env

# On Windows (PowerShell)
Copy-Item .env.example -Destination BackEnd\.env
```

Open `BackEnd/.env` in your text editor and update the following values:

```env
# Server
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Get yours at https://aistudio.google.com/)
GOOGLE_GEMINI_KEY=your_actual_gemini_api_key_here

# PostgreSQL Connection String
# Example (Local):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codereview
# Example (Supabase Cloud):
# DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres

# Session Secret (Generate via: openssl rand -hex 32)
SESSION_SECRET=super_secret_session_key_min_32_characters_long

# Frontend URL for CORS
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Setup the Backend

1. Navigate to `BackEnd/` and install dependencies:
   ```bash
   cd BackEnd
   npm install
   ```

2. Run database migrations to create the required tables (`users` and `session`):
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   *(Optional)* To inspect and manage database records visually:
   ```bash
   npm run db:studio
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server should start on **`http://localhost:3000`**.

---

### Step 4: Setup the Frontend

In a new terminal window, navigate to `FrontEnd/`:

1. Install frontend dependencies:
   ```bash
   cd FrontEnd
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 API Reference

### **Authentication Endpoints** (`/auth`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account | `{ "displayName": "Alex", "email": "alex@example.com", "password": "password123" }` |
| `POST` | `/auth/login` | Authenticate existing user | `{ "email": "alex@example.com", "password": "password123" }` |
| `GET` | `/auth/me` | Fetch currently logged-in user profile | *None (Cookie session)* |
| `POST` | `/auth/logout` | Terminate session & destroy cookie | *None* |

### **AI Review Endpoints** (`/ai`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/get-review` | Generates AI code review for submitted code | `{ "code": "function sum() { return 1 + 1; }" }` |

---

## 🛠️ Available Scripts

### **Backend (`BackEnd/`)**
- `npm run dev` — Starts the backend server with hot-reload via `tsx watch`.
- `npm run build` — Compiles TypeScript code using `tsc`.
- `npm start` — Runs the compiled production server.
- `npm run db:generate` — Generates SQL migration files using Drizzle Kit.
- `npm run db:migrate` — Applies pending SQL migrations to PostgreSQL.
- `npm run db:studio` — Opens Drizzle Studio in browser for database inspection.

### **Frontend (`FrontEnd/`)**
- `npm run dev` — Starts the Vite development server.
- `npm run build` — Builds the optimized production bundle.
- `npm run preview` — Locally previews the production build.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**.
