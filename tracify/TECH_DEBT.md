# ⚠️ Technical Debt Register

> Every shortcut and known risk, ranked by impact. Address these before scaling.

---

## Critical (Must Fix Before Production)

### TD-001: Monolithic Frontend — Single 3,100-line App.tsx
- **Impact:** 🔴 High — Unmaintainable, blocks team parallelism, no code splitting
- **Location:** `frontend/src/App.tsx`
- **Description:** All 10 modules, state management, constants, and 8 district definitions live in one file. No component splitting, no routing library, no state management library.
- **Remediation:**
  1. Extract each module into `src/modules/{ModuleName}/index.tsx`
  2. Add React Router for page-level navigation
  3. Introduce Zustand or Redux Toolkit for shared state
  4. Move constants to `src/constants/` and types to `src/types/`
  5. Lazy-load modules with `React.lazy()` + Suspense

### TD-002: No Authentication or Authorization
- **Impact:** 🔴 High — Anyone can access admin panel and all endpoints
- **Location:** Frontend role switcher is UI-only; backend has zero auth
- **Description:** The role switcher (Farmer/Consumer/Admin) is a React state toggle with no server validation. API endpoints are fully open.
- **Remediation:**
  1. Implement Firebase Auth or Auth0
  2. Add JWT middleware to FastAPI
  3. Role-based route guards on frontend
  4. Backend authorization decorators per endpoint

### TD-003: No Persistent Storage
- **Impact:** 🔴 High — All farm, order, product, and scan data lost on refresh
- **Location:** All modules use React `useState` for data
- **Description:** Farms, orders, products, irrigation logs, scan history, and harvest records exist only in browser memory.
- **Remediation:**
  1. Set up Firestore (already has Firebase dependency) or PostgreSQL
  2. Create CRUD API endpoints on backend
  3. Replace in-memory state with API calls + caching

### TD-004: API Key Exposure Risk
- **Impact:** 🔴 High — Gemini API key placeholder in frontend source
- **Location:** `frontend/src/App.tsx` (Gemini config block)
- **Description:** The original code had a Gemini API key placeholder in client-side code. Even though it's currently blank, the pattern invites placing secrets in frontend source.
- **Remediation:**
  1. Create a backend proxy endpoint for Gemini calls
  2. Store API keys in server-side environment variables only
  3. Add `.env` to `.gitignore` (already done) and audit git history

---

## High (Fix Before Beta)

### TD-005: No Error Boundaries in React
- **Impact:** 🟠 High — One module crash takes down the entire app
- **Description:** No `ErrorBoundary` components. A runtime error in any module renders a white screen.
- **Remediation:** Add error boundaries per module with graceful fallback UI.

### TD-006: No Frontend Tests
- **Impact:** 🟠 High — No regression safety net for UI changes
- **Description:** Zero test files for the frontend. Backend has only 4 tests.
- **Remediation:**
  1. Add Vitest + React Testing Library
  2. Unit tests for each module
  3. Integration tests for API-connected flows
  4. E2E tests with Playwright

### TD-007: Hardcoded District Data in Frontend
- **Impact:** 🟠 Medium — Duplicate/stale data, inconsistent with backend
- **Location:** `BD_DISTRICTS` array in `App.tsx` (8 districts with sample weather)
- **Description:** Frontend has 8 hardcoded districts with static weather. Backend knows 64 districts from the CRU TS dataset. These are out of sync.
- **Remediation:** Fetch district list from `/api/yield/meta` and populate dynamically.

### TD-008: No HTTPS in Default Config
- **Impact:** 🟠 Medium — Data transmitted in plaintext
- **Description:** Docker Compose and dev setup use HTTP only.
- **Remediation:** Add nginx reverse proxy with Let's Encrypt or use cloud LB with TLS.

---

## Medium (Fix Before v2.0)

### TD-009: No Rate Limiting
- **Description:** API has no request throttling. Vulnerable to abuse.
- **Remediation:** Add SlowAPI or cloud API gateway rate limiting.

### TD-010: No Request Logging
- **Description:** No structured logging. Can't debug production issues or track usage.
- **Remediation:** Add Python `logging` with structured JSON output; ship to ELK/CloudWatch.

### TD-011: No CI/CD Pipeline
- **Description:** No automated build, test, or deployment pipeline.
- **Remediation:** Set up GitHub Actions with: lint → test → build → deploy stages.

### TD-012: No Model Versioning
- **Description:** Models are static JSON files with no version tracking or rollback capability.
- **Remediation:** Integrate MLflow or DVC for model versioning and experiment tracking.

### TD-013: Firebase Demo Fallback
- **Description:** Firebase initializes with a demo config if no real config is provided. This can mask misconfiguration.
- **Remediation:** Fail explicitly or disable Firebase-dependent features when config is missing.

---

## Low (Improvement Opportunities)

### TD-014: No i18n Framework
- **Description:** Bengali/English text is hardcoded. No proper internationalization.
- **Remediation:** Add react-i18next with Bengali and English locale files.

### TD-015: No Accessibility (a11y) Audit
- **Description:** No ARIA labels, keyboard navigation untested, contrast ratios unchecked.
- **Remediation:** Run axe-core audit; add ARIA attributes; test with screen reader.

### TD-016: No PWA Support
- **Description:** Farmers in rural Bangladesh need offline access. No service worker or manifest.
- **Remediation:** Add Vite PWA plugin with offline caching strategy.

---

*Last updated: 2026-11-20*
