# Scholarly Atelier — Web

A **task & list manager** web app built with **Vite + React + TypeScript**, consuming a deployed
**Quarkus REST backend** with **Firebase Authentication** and JWT-authorized API calls. It is the
web counterpart of the EduTask mobile app and reuses its types, services, and hooks.

> Individual final project — TEC S6 *Desarrollo de Aplicaciones*. Web module (optional, deployed
> publicly to Vercel). The mobile app lives in a separate repository.

**Live app:** https://scholarly-atelier-nine.vercel.app
**Backend:** https://to-do-860378882125.us-central1.run.app (`GET /status` health check)

---

## Features

- **Authentication** — Firebase email/password sign-in + sign-up with the backend's two-system
  onboarding (`POST /user`). Session persists across reloads; protected routes; working logout.
- **Dashboard** — “Due Today”, smart-list shortcuts, and a grid of task-list cards with progress.
- **Lists** — full CRUD with a color picker and an icon picker (backend catalog).
- **Tasks** — full CRUD with priority, due date, multi-list membership; optimistic completion toggle.
- **Smart lists** — Today / Overdue / High Priority / All, aggregated client-side.
- **Search** — debounced search across lists and tasks.
- **About / Profile** — project info, the signed-in user's profile, stats, and logout.
- **Extras (no backend change):** ⌘K command palette, bulk multi-select, undo-on-delete, a
  calendar view, a drag-and-drop kanban board, an analytics dashboard, and CSV/JSON/iCal export.
- **UX** — consistent loading / error / empty states; HTTP errors normalized and surfaced.

## Tech stack

| Concern | Choice |
|---|---|
| Build | Vite + React 19 + TypeScript (strict) |
| Routing | React Router v7 (`createBrowserRouter`) |
| Auth | Firebase JS SDK (web `browserLocalPersistence`) |
| Networking | Axios — custom instance + request/response interceptors (Bearer token, 401 refresh+retry, error normalization) |
| Server state | TanStack Query |
| Client state | Zustand (auth, theme, UI) |
| Styling | Tailwind CSS v4 + shadcn/ui; Manrope + Inter |
| Forms | react-hook-form + zod |
| Charts / DnD | recharts · dnd-kit |
| Tests | Vitest + React Testing Library (unit/integration) · Cypress (E2E) |

## Architecture

```
src/
├── app/          # router, RootLayout, ProtectedRoute, AppBoot
├── components/   # ui/ (shadcn), layout/, feedback/, lists/, tasks/
├── config/       # env (import.meta.env.VITE_*)
├── lib/          # firebase, axios http + interceptors, query client, utils
├── stores/       # zustand (auth, theme, ui)
├── services/     # typed API calls (auth, user, tasklist, task, icon, search)
├── hooks/        # TanStack Query hooks
├── routes/       # screen components
├── types/        # API DTO types
└── utils/        # errors, format, query keys, validation, smart lists, export, …
```

Data flow: **screen → query hook → service → axios instance → backend**. Screens never call axios
directly. The Firebase ID token is attached by the request interceptor and refreshed on 401.

## Prerequisites

- Node.js ≥ 20, npm
- A Firebase project with Email/Password sign-in enabled (the one the backend verifies tokens against)

## Setup

```bash
git clone https://github.com/etxsA/to-do-web.git
cd to-do-web
npm install
cp .env.example .env   # then fill in the values (see below)
```

### Environment variables

All vars are prefixed `VITE_` (inlined into the client bundle by Vite — public by design; the
Firebase web apiKey is not a secret). See **`.env.example`**:

```env
VITE_API_BASE_URL=https://to-do-860378882125.us-central1.run.app
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=todo-list-58e01.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=todo-list-58e01
VITE_FIREBASE_STORAGE_BUCKET=todo-list-58e01.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=46678213730
VITE_FIREBASE_APP_ID=
```

> The exact Firebase config values are provided **with the submission** (intentionally not committed
> to this public repository). Paste them into your local `.env`. On Vercel they live in
> Project → Settings → Environment Variables.

> **CORS:** the backend allowlist is fixed to `http://localhost:5173`, `http://127.0.0.1:5173`, and
> `scholarly-atelier*.vercel.app`. The dev server therefore **must** run on port **5173** (pinned in
> `vite.config.ts`), and the public deploy must be the Vercel project **`scholarly-atelier`**.

## Run

```bash
npm run dev       # http://localhost:5173
npm run build     # type-check (tsc -b) + production build to dist/
npm run preview   # serve the production build locally
```

## Test

```bash
npm run test      # Vitest + React Testing Library (unit/integration)

# Cypress E2E (needs the dev server running + creds):
cp cypress.env.example.json cypress.env.json   # fill in the test password
npm run dev                                     # in one terminal
npm run cypress:run                             # in another
```

## Test users

Seeded accounts (Firebase + backend rows already exist):

| Email | Notes |
|---|---|
| `dav@gmail.com` | 22 lists — good for paging/search demos |
| `dav1@gmail.com` | |
| `2@gmail.com` | |

> Password is **provided to the evaluator with the submission** (a shared test-environment
> password; intentionally not stored in this public repo).

## Deploy (Vercel)

The app is deployed on Vercel as the project **`scholarly-atelier`** (the name is required so the
host matches the backend's CORS allowlist).

```bash
npm i -g vercel
vercel link            # select the existing "scholarly-atelier" project
# set the same VITE_* vars in Project → Settings → Environment Variables
vercel --prod
```

`vercel.json` rewrites all routes to `index.html` so client-side routes (deep links like
`/lists/:id`) resolve on refresh.

## Notes & known limitations

- The backend's database **resets to seed data on each restart/redeploy**.
- The backend's `/task/{id}` endpoints don't enforce per-user ownership; the client only ever acts on
  the signed-in user's own data.
- `PATCH /task/{id}` is a full replace — the edit form always sends every field.
- Sharing/membership is stubbed server-side, so lists are effectively single-owner.

## Git workflow

Gitflow: `main` (releases) ← `develop` (integration) ← `feature/*`. Pull requests are created and
merged via the GitHub CLI (`gh`).
