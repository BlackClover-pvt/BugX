# AI Code Review
## Two-Week End-to-End Project Blueprint

A developer-focused web application that reviews pasted code or individual source files, identifies potential defects and security issues, explains findings, and suggests improvements.

- **Project scope:** AI Code Review application only
- **Timeline:** 14 days, from repository setup to deployment
- **Primary input:** Pasted code snippets and individual source files
- **Core AI output:** Structured findings with severity, explanation, line range, and suggested fix
- **Engineering baseline:** Authentication, persistence, review history, validation, tests, and deployment
- **Extension mode:** Build from scratch or extend an existing basic code-review app

> **Critical instruction for any coding LLM:** This file is the product specification, not permission to edit the repository. The LLM must inspect first, explain its plan, list the files and commands it proposes to change/run, ask for approval, and wait. It must not modify files, install packages, run migrations, delete data, or deploy without explicit user approval.

**Version:** 1.0  
**Prepared:** 12 October 2026  
**Note:** Stack versions must be checked and pinned during implementation.

---

## Table of contents

1. [How to use this specification with an LLM](#how-to-use-this-specification-with-an-llm)
2. [Product definition and scope](#product-definition-and-scope)
3. [Recommended technology stack](#recommended-technology-stack)
4. [System architecture](#system-architecture)
5. [Data model and API](#data-model-and-api)
6. [Functionality description](#functionality-description)
7. [End-to-end user and system workflow](#end-to-end-user-and-system-workflow)
8. [Security, privacy, reliability and quality](#security-privacy-reliability-and-quality)
9. [Two-week roadmap](#two-week-roadmap-14-days)
10. [LLM implementation contract and reusable prompts](#llm-implementation-contract-and-reusable-prompts)
11. [Final acceptance checklist and CV evidence](#final-acceptance-checklist-and-cv-evidence)

---

AI CODE REVIEW
Two-Week End-to-End Project Blueprint

A developer-focused web application that reviews pasted code or individual source files,
identifies potential defects and security issues, explains findings, and suggests
improvements.

Specification item               Decision

Project scope                       AI Code Review application only

Delivery timeline                 14 days, from repository setup to deployment

Primary input                     Pasted code snippets and individual source files

Core AI output                      Structured findings with severity, explanation, line range and suggested fix

Engineering baseline                 Authentication, persistence, review history, validation, tests and deployment

Extension mode                Can be used to build from scratch or extend an existing basic code-review app

Critical instruction for any coding LLM: This PDF is the product specification, not permission to edit the repository. The
LLM must inspect first, explain its plan, list the files and commands it proposes to change/run, ask for approval, and
wait. It must not modify files, install packages, run migrations, delete data, or deploy without explicit user approval.

Version 1.0 | Prepared 12 October 2026 | Stack versions must be checked and pinned during implementation.

## 0. How to use this PDF with an LLM

Give this complete PDF to the coding assistant together with the current project folder or repository when one exists. Ask it to
follow the staged process below. The aim is controlled, incremental development with explicit approvals—not a one-shot code
dump.

### Required operating protocol

- Step 0 - Clarify the working mode. Ask whether to build from scratch or extend an existing code-review project if this is not
already clear. Do not repeat a question the user has already answered.

- Step 1 - Read-only discovery. Inspect the file tree, package manifests, existing screens, API routes, database schema, tests and
deployment files. Do not edit files during discovery. Explain any commands before running them if the user requires
command-by-command approval.

- Step 2 - Gap analysis. Map existing features to this specification using KEEP / MODIFY / ADD / DEFER. Identify compatibility
risks, missing requirements, duplicated logic and secrets/configuration concerns. Do not assume the existing code is disposable.

- Step 3 - Present a phase plan. State the exact outcome, files to be created or modified, dependencies, commands/migrations,
tests and risks for the next phase.

- Step 4 - Ask and wait. Ask the user to approve that phase and resolve required project-specific questions. Do not begin
implementation until approval is explicit.

- Step 5 - Implement only the approved phase. Preserve unrelated functionality. Do not silently expand scope or start the next
phase.

- Step 6 - Verify and report. Give the exact commands to run, tests actually executed, results, manual checks and known
limitations. Never claim a test passed if it was not run.

- Step 7 - Pause at the gate. Summarize changed files and ask whether to proceed to the next phase. Wait for the user's response.

### Approval applies to every phase

The LLM must ask before each implementation phase, dependency installation, schema migration, destructive operation,
external provider configuration, and deployment. It must also ask before replacing architecture or refactoring large
portions of an existing codebase. Read-only inspection and safe explanations must not be used as a pretext for
unauthorized edits.
Required first response from the LLM
I have read the AI Code Review project specification.

Before I make changes, I will:

## 1. Confirm whether this is a new project or an existing app (unless already known).

## 2. Inspect the current files in read-only mode, after explaining any commands I propose to run.

## 3. Map existing functionality to the specification and identify gaps.

## 4. Present the proposed next phase, files/commands, risks, acceptance criteria, and questions.

## 5. Wait for your explicit approval before modifying anything.

I will work on one approved phase at a time and stop at every approval gate.

### What the project must NOT become

- No GitHub App, Git repository connection, pull-request review bot or webhooks in this 2-week MVP.

- No repository-wide quality assistant, repo-health dashboard, multi-repository scanning or codebase analytics.

- No executing user-submitted code, running build scripts, installing packages from submitted code, or applying fixes automatically.

- No automatic commits or writes back to source repositories. Suggested fixes are explanatory text/code for the user to inspect.

## 1. Product definition and scope

Project name: AI Code Review
Build an authenticated web app where a developer pastes a code snippet or uploads one source file, chooses the programming
language and review focus, and receives a structured AI review. The result should identify likely issues, show severity and line
ranges, explain why each finding matters, and recommend an improvement.
Target users and main problem
- Students and developers who want a second opinion on a specific snippet or source file.

- Users need actionable review findings rather than a generic paragraph saying the code looks good.

- Users need a history of their reviews, the ability to reopen past results, and clear control over whether submitted code is stored.

### MVP requirements

Area            MVP behavior                                                                           Priority

Authentication            Register, login, logout, current user; securely hashed passwords and protected sessions.       Must

Code input             Paste code or upload one supported source file; select language; enforce size limits.           Must

Review scope         Choose categories: correctness/bugs, security, performance, readability/maintainability, or      Must
general review.

AI review                Structured response: summary, overall risk, findings, severity, category, line ranges,           Must
explanation and suggested fix.

Review history         View prior reviews, reopen result and delete review/code data.                             Must

Persistence             Store reviews, status, structured findings, timestamp and user ownership.                    Must

Reliability                 Loading/error/retry behavior; provider timeout and rate-limit handling.                       Must

Quality                   Input validation, authorization checks, core tests, README and deployed application.          Must

Comparison UI           Optional side-by-side display of original and suggested code for a finding.                    Should

Export                   Optional download of a review report as Markdown or JSON.                               Should

### Explicitly out of scope

- Repository-wide review, repo-quality assistant features, GitHub/GitLab integration, PR review automation and multi-file
dependency mapping.

- Running user code, containers/sandboxes for execution, compilation, tests or static-analysis tools that execute submitted artifacts.

- Automatic code patch application, commits, push operations or changes to the user's original files.

- Team organizations, billing, admin analytics, custom model fine-tuning and multi-tenant enterprise features.
Definition of done: A user can register and log in, submit code, receive structured findings, revisit and delete past
reviews, and use the deployed app. Another user must not be able to read or delete those reviews by guessing IDs.

## 2. Recommended technology stack

Use one main application backend and call the selected LLM provider from the server. A separate Python AI service is not
required for this project because the principal intelligence comes from an LLM API and structured prompting. This reduces
integration work and leaves more time for security, testing and deployment.

Layer            Chosen stack                         Use

Frontend              React + Vite + TypeScript                       Responsive SPA, code editor/input screens and review
results.

UI                      Tailwind CSS + shadcn/ui                         Accessible forms, tabs, cards, tables, dialogs and layout.

Routing               React Router                                       Login, dashboard, new review, review detail and settings.

Server-state/forms      TanStack Query; React Hook Form + Zod          API state, loading/retry, form handling and client validation.

Code editing         Monaco Editor OR CodeMirror                      Syntax-highlighted code input; choose one based on
integration speed.

Backend               Node.js LTS + Express + TypeScript           REST API, session management, review orchestration and
persistence.

Validation            Zod                                                Validate request bodies, query params and the AI's returned
structure.

Database             PostgreSQL                                      Users, sessions, reviews and structured findings/history.

ORM/migrations         Drizzle ORM                                Typed schema, queries, constraints and versioned migrations.

Authentication          Argon2id + server-side sessions + PostgreSQL     Password hashing and persistent sessions; use secure
session store                                       cookies.

AI integration           Server-side SDK for selected LLM provider        Send bounded code and review instructions; request
schema-constrained output where supported.

Layer            Chosen stack                         Use

Testing                   Vitest + Supertest + React Testing Library;            Unit, API integration, UI and end-to-end verification.
Playwright for one key E2E flow

Delivery              Docker Compose + GitHub Actions                Reproducible local setup and CI lint/type/test/build checks.

Deployment          Managed PostgreSQL + a host for frontend/API;     Live public demo; pick provider after checking current limits
container support as needed                    and pricing.

### Stack decisions and constraints

- Do not use a frontend-only LLM call. Provider API keys must remain on the server.

- Use a provider adapter module so model/provider configuration does not leak into controllers or UI components.

- Use the newest compatible stable versions only after checking the official documentation at implementation time; commit lockfiles
and pin dependencies.

- Do not add LangChain, vector databases, Redis, queues or a Python inference service unless a confirmed requirement justifies the
extra complexity.

- For code input, use a reasonable configurable maximum size. Review of one file/snippet is the supported workflow; large project
uploads are not in scope.

## 3. System architecture

Architecture style: modular monolith with an LLM provider adapter
+------------------------ Browser -------------------------+
| React + Vite + TypeScript                                |
| Login | Dashboard | Code Input | Findings | Review History|
+----------------------------+-----------------------------+
| HTTPS / JSON + session cookie
v
+---------------------- Express API -----------------------+
| Request validation (Zod)                                 |
| Session authentication + authorization                    |
| Rate limits + size limits + centralized error handling   |
|                                                         |
| Auth module | Review module | History module | Config     |
|                      |                                  |
|              Review Orchestrator                         |
|           /             |               \               |
|          v              v                v              |
|   Prompt builder   Provider adapter   Persistence       |
+---------+----------------+----------------+--------------+
|                |                |
|                v                v
|        External LLM API   +-------------+
|        (server-side key)  | PostgreSQL  |
|                           | users       |
|<---- validated JSON ------| sessions    |
|                           | reviews     |
|                           | findings    |
|                           +-------------+
v
+-------------------- Validated Result --------------------+
| Parse/validate schema -> normalize findings -> persist   |
| -> return safe response -> render as text/code, not HTML |
+----------------------------------------------------------+

### Component responsibilities

Component                 Responsibilities

Frontend                         Collect code and review options; display loading/errors; render severity, line ranges and suggested fixes;
manage review history UI.

Auth middleware              Resolve the current user from the server-side session; protect private routes; never trust client-supplied
user IDs.

Review API/service              Validate submission; enforce code limits and rate limits; create review record; call provider; update status
and save normalized results.

Prompt builder                 Separate trusted review instructions from untrusted code content; request actionable, non-speculative
findings.

Provider adapter                 Call provider with timeout, token/cost bounds and model configuration; normalize provider errors.

Result validator               Parse returned JSON, validate with Zod, constrain line numbers/severity/category and reject malformed
output.

Database                        Persist user-owned reviews, code (according to stated retention policy), results, provider/model metadata
and timestamps.

### Request lifecycle

- 1. The user submits a code snippet or one supported file and selects language/review focus.

- 2. The backend authenticates the user, validates type/size, applies rate limits and informs the review service.

- 3. A review record is created with PENDING status, associated with the authenticated user.

- 4. The prompt builder sends the code as untrusted content to the configured LLM provider. No user code is executed.

- 5. The provider returns structured review data. The backend validates and normalizes it; invalid output is treated as a recoverable
failure.

- 6. The review and findings are persisted as COMPLETED, or marked FAILED with a safe error status if the provider fails.

- 7. The browser renders findings and suggested fixes. The original code remains unchanged.

### Failure behavior

- Provider timeout or rate limit: preserve the review record and show a safe retry action.

- Malformed output: do not blindly display raw provider output; validate, optionally retry once with a repair prompt, then mark failed.

- Database failure: return a safe error; do not falsely tell the user the review was saved.

- Review service failures must not leak keys, prompts with secrets, raw stack traces or other users' code.

## 4. Data model and API

Minimal relational schema

Table                  Core fields / rules

users                              id UUID PK, display_name, email UNIQUE, password_hash, created_at.

sessions                 Use a maintained PostgreSQL session-store schema; include session ID, session data and expiry. Never use
in-memory sessions in production.

reviews                           id UUID PK, user_id FK, title, language, review_focus, source_type (PASTED/FILE), code_content or a
documented storage reference, status (PENDING/COMPLETED/FAILED), overall_summary, overall_risk,
provider, model, created_at, updated_at.

review_findings                  id UUID PK, review_id FK, title, severity, category, start_line nullable, end_line nullable, explanation, impact,
recommendation, suggested_code nullable, created_at.

optional usage_events            id, user_id FK, review_id FK nullable, event_type, model, input/output token metadata if exposed by provider,
created_at. Add only if time permits.

### Data integrity requirements

- Every review belongs to one user; every finding belongs to one review. Enforce foreign keys and useful indexes.

- Use ON DELETE CASCADE for findings when a review is deleted, if that matches the chosen retention policy.

- All queries for review detail, update or delete must be scoped to the authenticated user. Guessing an ID must never grant access.

- Use transactions when creating/updating a review and its findings so partial results do not appear as completed reviews.

- Decide and disclose whether the submitted code is stored. MVP default: persist it to support history, show a clear notice, and allow
the user to delete the review and its associated code/findings.

- A deletion must remove the stored code and findings in the primary database; document any unavoidable backups/log retention
policy if applicable.

### Core REST endpoints

Method         Endpoint                                    Expected behavior

POST                /api/v1/auth/register                                    Create user with hashed password; reject duplicate email.

POST                /api/v1/auth/login                                             Verify credentials and create server-side session.

GET                /api/v1/auth/me                                        Return current user profile.

POST                /api/v1/auth/logout                                            Invalidate session and clear cookie.

POST               /api/v1/reviews                                             Validate request; create review; run review; persist
structured result/status.

GET                 /api/v1/reviews                                                    List current user's reviews with pagination, filters and safe
metadata.

GET                 /api/v1/reviews/:reviewId                                Return one review plus findings only if owned by current
user.

DELETE             /api/v1/reviews/:reviewId                                 Delete an owned review and its stored code/findings.

POST                /api/v1/reviews/:reviewId/retry                               Optional: retry a failed review after checking ownership
and rate limits.

GET                  /api/v1/health                                          Return service health without exposing secrets or
database credentials.

### Example review request

{
"title": "Check login validation",
"language": "typescript",
"reviewFocus": ["correctness", "security", "readability"],
"code": "function login(input) { /* user code */ }",
"storeCode": true
}

### Example normalized review response

{
"reviewId": "server-generated-uuid",
"status": "COMPLETED",
"summary": "Two potential issues were identified.",
"overallRisk": "MEDIUM",
"findings": [
{
"title": "Missing input validation",
"severity": "HIGH",
"category": "SECURITY",
"startLine": 1,
"endLine": 1,
"explanation": "Explain what the code does and why it may be unsafe.",
"impact": "Describe a plausible consequence without overstating certainty.",
"recommendation": "Validate the input before using it.",
"suggestedCode": null
}
]
}

The sample output is illustrative. The implementation must validate all AI-generated values and must not invent precise
line numbers when it cannot reliably determine them.

## 5. Functionality description

### 5.1 Authentication and user account

- Register, log in, log out, and retrieve current-user information.

- Hash passwords with Argon2id or a maintained equivalent. Never store plaintext passwords or return password hashes.

- Use server-side sessions stored in PostgreSQL. Configure HttpOnly, Secure in production, SameSite cookie policy, session expiry
and session ID rotation after login.

- Protect state-changing cookie-authenticated requests against CSRF; use HTTPS and strict CORS configuration in production.

- Rate-limit login and review creation; return consistent errors without revealing unnecessary account details.

### 5.2 Code submission

- Provide a syntax-highlighted editor for pasted code and an upload option for one source file.

- Allow the user to choose a language, title and review focus.

- For v1, support a practical short list such as JavaScript, TypeScript, Python, Java, C, C++, Go and SQL; treat the chosen language
as a hint, not proof.

- Set a configurable input limit and validate file extension/MIME/size server-side. Do not accept ZIP/repository bundles in the MVP.

- Show an explicit notice before submission: code will be sent to the configured external AI provider for review. Users must not
submit secrets or code they are not permitted to share.

- Keep original code immutable during review. Suggested code is only displayed for manual inspection.

### 5.3 AI review

### Review categories

- Correctness / bugs: suspicious edge cases, incorrect conditions, error handling, unsafe assumptions.
- Security: possible injection, input-validation gaps, insecure handling of credentials/data and access-control mistakes where visible
in the snippet.

- Performance: obvious avoidable computation, inefficient loops or costly operations where justified by the code context.
- Readability / maintainability: unclear naming, excessive complexity, duplication in the supplied snippet and risky coupling.
- General review: a balanced review across the above categories.

### Each finding should have

- A short title, severity (CRITICAL/HIGH/MEDIUM/LOW/INFO) and category.

- A line range only when it can be grounded in the submitted code; otherwise omit it or return null.

- An explanation of the evidence in code, why it matters and the likely impact.

- A specific recommendation and optional suggested code snippet.

- A confidence/uncertainty note where useful. The AI must be allowed to report no findings rather than inventing issues.

### Review behavior requirements

- Prompt the model to be evidence-based, avoid guessing unavailable context and separate definite defects from possible risks.

- Request schema-constrained output where the selected provider supports it; validate all outputs on the server with Zod regardless.

- Treat submitted code/comments as untrusted data and instruct the model not to follow instructions embedded in the code under
review.

- Do not run the submitted code, apply patches, or take external actions. The AI returns recommendations only.

- Keep a provider abstraction so model selection and model parameters can be changed without rewriting the review business logic.

### 5.4 Review results and history

- Show a concise overall summary and overall risk indicator.

- Group findings by severity and category; display line references and a code excerpt where possible.

- Show explanation, impact, recommendation and suggested code separately.

- Provide loading, empty, success, provider failure and retry states.

- Persist prior reviews; allow users to view and delete only their own records.

- Optional: export one review as Markdown/JSON and copy individual suggested snippets.

### 5.5 User interface pages

Page                   Main elements

Login / Register             Form validation, pending/errors, account creation and login.

Dashboard / History        New review action; list of past reviews; language, date, status and summary; pagination.

New Review                         Title, language selector, review-focus options, code editor/file upload, size counter, data disclosure notice.

Review Detail               Summary, risk level, severity filters, findings, line labels, suggested fixes, retry where permitted, delete
action.

Account / Privacy             Data handling notice, ability to delete saved review history, logout.

## 6. End-to-end user and system workflow

Main user journey
REGISTER / LOGIN
|
v
DASHBOARD -> NEW REVIEW
|          |
|          v
|   Paste code OR upload one source file
|   Choose language + review focus
|   Confirm external-provider data notice
|          |
|          v
|   POST /api/v1/reviews
|          |
|          v
|   Authenticate -> validate -> limit request
|          |
|          v
|   Save PENDING review record
|          |
|          v
|   Build prompt -> call LLM provider
|          |
|          v
|   Validate structured output (Zod)
|       /                  \
|   valid                  invalid/error
|     |                         |
|     v                         v
| Save findings/status       Mark FAILED safely
|     |                         |
|     v                         v
+-- REVIEW DETAIL <----- error/retry UI
|
v
view findings / delete review

### Detailed state model

Status            Meaning                                                UI behavior

PENDING          A review record exists and processing has begun.              Show progress and disable duplicate
submission for that review.

COMPLETED       A valid normalized review result and findings are persisted.       Show summary and findings.

FAILED                Provider call or output validation failed after safe handling.        Show safe message and retry if allowed; do
not display raw traces.

### Recommended v1 processing model

Use a synchronous API request for bounded code submissions to keep the architecture simple, while persisting the PENDING
state before the provider call. Enforce a request timeout and maximum code size. If host/request limits make this unreliable, ask
for approval before introducing background jobs; queues are not a default v1 requirement.

## 7. Security, privacy, reliability and quality

Code is sensitive user data. Security and transparency are part of the feature, not optional polish.

### Security requirements

- Password hashing, secure server-side sessions, session expiry, logout invalidation, CSRF protection, HTTPS and strict CORS.

- Every review query must be scoped to the authenticated user. Test cross-user access using known/guessed review IDs.

- Validate code size, file type, language, title and review-focus values. Set upload/body limits and request timeouts.

- Rate-limit authentication and expensive review requests to control abuse and LLM costs.

- Keep LLM provider keys only in server-side environment variables or a hosting secret manager; never put them in Vite-exposed
environment variables.

- Do not execute, compile or install dependencies from user-submitted code.

- Render model output as escaped text or code blocks. Never place model-generated HTML directly into the DOM.

- Treat comments/code as potential prompt injection. The model is not a security boundary; authorization and tool permissions
remain in application code.

- Avoid logging full source code, secrets, prompts or provider credentials. Log identifiers, timings and safe error codes instead.

- Clearly disclose that code is sent to a configured external AI provider and check provider data-use/retention terms before
deployment.

- Use safe fallback behavior for provider errors and malformed JSON; do not fabricate success.

### Minimum test matrix

Type                  Test cases

Unit                    Review output schema; severity/category mapping; size validation; error normalization; prompt construction
boundaries.

API integration               Register/login/logout; create review; provider mocked success/error/timeout; list/detail/delete; pagination.

Authorization            Anonymous review request denied; User A cannot list/read/delete User B's review; ID tampering returns safe
denial.

AI contract                 Missing findings allowed; invalid severity rejected/normalized; negative or out-of-range line numbers rejected;
malformed JSON handled.

Privacy                    Delete review removes stored code and findings; logs avoid full source/secrets; external-provider notice is
present.

End-to-end                Login -> submit code -> see findings -> open history -> revisit review -> delete review.

## 8. Two-week roadmap (14 days)

Plan for approximately 3–5 focused hours per day. The existing-project path starts with a read-only audit; the from-scratch path
establishes the same foundation. Every day ends with a checkpoint and explicit user approval before the next phase.

### DAY 1 - Discovery, requirements and approval

- If existing app: perform a read-only audit of structure, features, API, database, auth, tests and deployment; do not edit.

- If new: confirm product decisions, provider choice, privacy/retention policy and deployment constraints; propose architecture.

- Create a gap map (KEEP / MODIFY / ADD / DEFER), phase plan and acceptance criteria.

- Ask user to approve the implementation plan. No code changes yet.

Checkpoint: Approved scope, repo inventory and phase-by-phase plan.

### DAY 2 - Project foundation

- Set up or adapt frontend/backend structure while preserving existing conventions.

- Configure TypeScript, environment validation, error handling, lint/type-check scripts and test framework.

- Configure PostgreSQL connection and Drizzle migration workflow.

- Create .env.example and README skeleton; do not add real secrets.

Checkpoint: Application starts locally; database connection/migration path is documented.

### DAY 3 - Authentication and database

- Implement or adapt registration, login, logout and current-user endpoint.

- Add password hashing, persistent server-side sessions and protected routes.

- Create users/sessions/reviews/review_findings schema and migrations.

- Test auth failures and session persistence.

Checkpoint: A user can securely log in, and private routes are protected.

### DAY 4 - Review submission API

- Create review request/response schemas and server-side input limits.

- Implement POST review, review status transitions, persistence and error shape.

- Implement list/detail/delete endpoints scoped to the authenticated user.

- Test provider mocked response before wiring a live model.

Checkpoint: A review record can be created, listed, inspected and deleted using a mocked provider.

### DAY 5 - LLM provider adapter

- Choose/configure the provider only after user approval and secrets are available.

- Build prompt builder and provider adapter with timeout/cost limits.

- Request structured output and validate it with Zod.

- Handle malformed response, timeout, rate-limit, quota and provider failure.

Checkpoint: API returns a normalized structured review without leaking provider secrets.

### DAY 6 - Review UI input

- Build or adapt login, dashboard, new-review page and code input editor.

- Add language/review-focus selection, single-file upload, code-size indicator and data disclosure notice.

- Connect frontend to API with loading and error states.

Checkpoint: User can submit a code snippet/file from the browser.

### DAY 7 - Findings UI

- Display summary, overall risk, severity, category, line range, evidence and recommendations.

- Render suggested code safely; do not treat output as HTML.

- Add empty-results, no-findings and provider-failure states.

Checkpoint: A full code-review round trip works end to end.

### DAY 8 - Review history and data controls

- Build history list/detail navigation and pagination.

- Add delete flow with confirmation and cascade removal of code/findings.

- Ensure review ownership is checked for all list/detail/delete operations.

Checkpoint: History is useful and review privacy/ownership is enforced.

### DAY 9 - Reliability and security

- Add rate limits, body/file size limits, CSRF/CORS/cookie configuration and safe errors.

- Review logging, environment secrets and external-provider disclosure.

- Test cross-user access and prompt-injection-like content in submitted code.

Checkpoint: No obvious authorization bypass or accidental code execution path.

### DAY 10 - Backend and AI tests

- Add unit and integration tests for validation, review lifecycle, schema and error paths.

- Mock provider success, timeout, malformed output and rate limiting.

- Check history deletion and data constraints.

Checkpoint: Core backend tests pass locally.

### DAY 11 - Frontend and end-to-end tests

- Test forms, loading/error states and finding presentation.

- Create one end-to-end flow: login -> submit -> findings -> history -> delete.

- Fix defects discovered; avoid adding new features.

Checkpoint: Critical UI workflow is tested.

### DAY 12 - UI polish and deployment preparation

- Improve responsive layout and accessibility; finish empty states and confirmation dialogs.

- Add Dockerfile/Compose only where useful for repeatable local setup.

- Add CI for lint, type-check, tests and production build.

Checkpoint: Reproducible local setup and CI checks are ready.

### DAY 13 - Deployment

- Choose hosting based on verified current limits, pricing and environment support.

- Deploy frontend/API and provision managed PostgreSQL; configure secrets and HTTPS.

- Run migrations, verify cookies/CORS and test provider credentials in production.

Checkpoint: A live deployment passes smoke tests.

### DAY 14 - Final hardening and portfolio handoff

- Run the complete test suite and manual test matrix against deployment.

- Write README, architecture diagram, API notes, limitations and setup instructions.

- Add screenshots/demo walkthrough and sample code (non-secret, non-proprietary).

- Review costs, retention policy, known bugs and follow-up ideas.

Checkpoint: A working deployment and documented repository are ready for CV use.

### If the timeline slips

Protect                                                  Defer first

Authentication, user-owned history, structured AI review, result        Monaco-to-advanced editor features, Markdown/JSON export, fancy
validation, security controls, tests, deployment and README.          animations, retries beyond one safe retry, complex role
management, multi-file review, background queue, repository
integration.

## 9. LLM implementation contract and reusable prompts

The next prompts should be supplied to any coding LLM together with this PDF. The most important behavior is the approval
gate: plan first, get approval, make a narrow change, verify, then pause.

### Reusable phase prompt

You are the senior engineer for the AI Code Review project.
Treat the attached project blueprint as the requirements source.

STRICT USER-APPROVAL RULES:
- Do not edit or create files until I approve the current phase.
- Do not install packages, run migrations, delete/overwrite files, change database data,
configure external services, or deploy unless I have approved those actions.
- Start by inspecting the existing project in read-only mode if a project is present.
- If a basic code-review app already exists, preserve it. Do not replace it with a new
scaffold unless I explicitly approve a rebuild.
- Before any phase, show: goal, assumptions, questions, files affected, dependencies,
commands/migrations, security impact, tests and acceptance criteria.
- Ask all required questions together when practical, then wait for my explicit approval.
- Implement only the approved phase. Do not continue to the next phase automatically.
- Do not repeat questions I already answered.
- After the phase, report files changed, commands run, actual test results, known issues
and manual verification steps. Never claim tests passed unless they actually ran.
- If an unexpected destructive change or major architecture choice becomes necessary,
stop and ask again.

CURRENT MODE:
[Choose: NEW PROJECT / EXTEND EXISTING BASIC CODE-REVIEW APP]

CURRENT PHASE:
[Insert only one approved roadmap phase]

Acceptance criteria:
[Insert measurable completion conditions]

First response must be a plan and questions, not code. Wait for approval.

### Read-only audit prompt for an existing basic project

Audit my existing AI Code Review project against the attached blueprint.
This is READ-ONLY discovery. Do not edit files, install dependencies, change the
database, generate replacement files, or deploy.

Report:

## 1. Existing stack and how the app currently starts.

## 2. Frontend pages/components and backend routes/services.

## 3. Database tables/migrations and current authentication/security behavior.

## 4. What the current code-review feature already does.

## 5. A gap matrix: KEEP / MODIFY / ADD / DEFER, mapped to the blueprint.

## 6. Risks, broken assumptions, secrets/configuration concerns and test coverage.

## 7. A proposed sequence of small phases; for each, list files, dependencies,

commands, migrations, tests and acceptance criteria.

## 8. Questions that must be answered before implementation.

Do not implement the plan. End by asking me which phase to approve first.

### From-scratch kickoff prompt

I want to build the AI Code Review app from scratch using the attached blueprint.
Before creating files, ask me to confirm unresolved choices such as:
- selected LLM provider/model and whether I have API access;
- whether code should be stored in review history by default;
- deployment preference or constraints;
- whether pasted snippets, single-file upload, or both are needed in v1.

Propose a minimal architecture and Phase 1 plan. List files and commands you intend
to use, likely costs/risks and acceptance criteria. Make no changes until I approve.

### Approval response format the LLM should use

Item                      Required before implementation

Phase goal                One small outcome, not the whole project.

Questions and assumptions     Ask about unknowns that affect architecture, cost, data handling or UX.

Files                                  List files to create/modify/delete and why; default is no deletion.

Commands                          List installs, migrations, tests, build and deployment commands before running them.

Risk                          Mention data loss, provider data transfer, schema compatibility and rollback plan.

Acceptance criteria             Measurable checks proving the phase is complete.

Approval                             Explicitly ask permission and wait. No implementation before approval.

## 10. Final acceptance checklist and CV evidence

### Release acceptance criteria

- User registration/login/logout works and passwords are securely hashed.

- Protected endpoints use server-side session identity and cannot expose another user's reviews.

- User can paste code or upload one supported source file and choose review language/focus.

- Review results contain validated summary and structured findings with severity and explanations.

- Provider failures and malformed output are handled without crashing or falsely claiming success.

- Review history persists and users can delete their own stored code/results.

- The application never executes submitted code and never exposes the LLM API key to the browser.

- Core unit/integration tests and one end-to-end test pass.

- Deployment is live, README is complete, and environment configuration is documented without secrets.

### CV bullet template - use only after implementing the described capabilities

AI Code Review Platform | React, TypeScript, Node.js, Express, PostgreSQL, Drizzle ORM, LLM API
- Developed a full-stack code review application with secure authentication, persistent review history and user-scoped access
controls.
- Integrated structured LLM-based analysis to identify potential bugs, security concerns, performance risks and maintainability
issues, returning severity-ranked findings and suggested fixes.
- Implemented schema-validated AI responses, rate limits, automated API/UI tests and a deployed application with documented
setup and architecture.

### Add real metrics only after measurement

- Report latency only from recorded tests and describe the code size/model configuration used.

- Report cost per review only if you captured provider usage and calculated it using the actual price at the time.

- Do not claim that the AI finds all bugs or provides guaranteed security assurance. Describe it as decision support requiring human
review.

### Official documentation and implementation references

React and TypeScript: https://react.dev/learn/typescript

Express production security practices: https://expressjs.com/en/advanced/best-practice-security.html

Drizzle ORM documentation: https://orm.drizzle.team/docs/overview

PostgreSQL documentation: https://www.postgresql.org/docs/

OWASP GenAI / LLM Security Top 10 (2026): https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/README.md

This blueprint deliberately avoids fixed package versions and hosting-provider promises. The coding LLM should verify current stable versions, model
capabilities, data-retention terms, deployment limits and pricing before the user approves those choices.
