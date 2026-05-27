# GetjobAI frontend

Next.js app for AI-powered resume building and optimization: guided wizard, PDF parsing, LinkedIn import, resume editor, template styles, PDF preview and ATS optimization.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, Shadcn/UI, Lucide icons
- **State:** TanStack Query, React Hook Form + Zod
- **Auth:** Clerk
- **Database:** Neon (Postgres), Drizzle ORM — wizard session state
- **API clients:** Orval (Axios) from OpenAPI — backend API
- **Deploy:** Vercel

## Main flows

- **Dashboard** — create resumes (upload, 9-step wizard, LinkedIn import) and manage saved resumes
- **Wizard** — step-by-step resume builder with encrypted session persistence
- **PDF parsing** — coming soon...
- **LinkedIn import** — coming soon...
- **Editor** — section tabs (contact, experience, job tailoring, etc.) with live PDF preview
- **Templates** — `professional`, `technical`, `minimal` (Typst-based PDF generation)
- **Optimization** — coming soon...

## Development

```bash
git clone https://github.com/GetJobAI/frontend.git
cd frontend
pnpm install
cp .env.example .env   # define own environment variables
pnpm dev
```

Requires the backend API (and PDF service) running locally — see sibling [`../infra` repo](https://github.com/GetJobAI/infra).

Or just use the Docker Compose setup:

```bash
git clone https://github.com/GetJobAI/infra.git
cd infra
just up
```

### Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start Next.js dev server (Turbopack) |
| `pnpm build`   | Production build                     |
| `pnpm db:push` | Push Drizzle schema to Neon          |
