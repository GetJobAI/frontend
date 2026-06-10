# GetjobAI frontend

Next.js app for AI-powered resume building and optimization: guided wizard, PDF parsing, LinkedIn import (soon), resume editor, template styles, PDF preview and ATS optimization.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, Shadcn/UI
- **State:** TanStack Query, React Hook Form
- **Auth:** Clerk
- **Database:** Neon (Postgres), Drizzle ORM — wizard session state
- **API clients:** Orval (Axios) from OpenAPI — backend API
- **Deploy:** Vercel, Docker

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [just](https://github.com/casey/just) — command runner for local scripts
- [Docker](https://www.docker.com/) — backend stack (infra)

---

## Option A — Local frontend development (clone this repo)

Use this when you work on the Next.js app with hot reload.

```bash
git clone git@github.com:GetJobAI/frontend.git
cd frontend

pnpm install
cp .env.example .env   # fill in Clerk, Neon, etc.
just up                # clones infra/, starts backend, syncs Orval clients
pnpm dev               # http://localhost:3000
```

- **Frontend:** `http://localhost:3000` (`pnpm dev`)
- **Backend API:** `http://localhost:8080` (gateway from infra)
- **Stop backend:** `just down`

`just up` clones [GetJobAI/infra](https://github.com/GetJobAI/infra) into `infra/` on first run (gitignored), pulls latest changes, restarts Docker Compose, fetches OpenAPI specs, and regenerates API clients.

Override infra location or repo if needed:

```bash
INFRA_DIR=/path/to/infra INFRA_REPO=git@github.com:GetJobAI/infra.git just up
```

---

## Option B — Full stack via infra only (no frontend clone)

Use this to run the prebuilt frontend container together with the backend — no local Node/pnpm setup.

```bash
git clone git@github.com:GetJobAI/infra.git
cd infra

cp .env.example .env   # fill in DB, Clerk, Gemini, etc.
just up                # docker compose up -d
```

- **App (frontend + API):** `http://localhost:8080` (default `HTTP_PORT` in `.env`)
- **Stop stack:** `just down`

The frontend image is pulled from `ghcr.io/getjobai/frontend:latest` (see `frontend/compose.yml` in the infra repo).
