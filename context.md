# Team Context

## Company / Project
BotStacks Sandbox — a platform for building, managing, and deploying AI chat assistants (bots).
Users are businesses that want to embed a customizable chat widget on their site. The platform lets
them create bots, teach them knowledge (via site crawls or doc uploads), customize the widget
appearance, and monitor conversations. The product is multi-tenant (workspace-based).

## Tech Stack
- **Frontend:** React 19 + Vite + TypeScript, CSS Modules, React Router, Strawberry GraphQL client
- **API:** FastAPI + Strawberry GraphQL + PostgreSQL + Alembic migrations, uv for deps, mypy + ruff for linting
- **Core:** LangChain + Pinecone + crawler pipeline (in progress)
- **Auth:** Google OAuth (authlib)
- **Infra:** Docker Compose locally, DigitalOcean Container Registry (DOCR), Kubernetes via a separate deploy repo (`botstacks-sandbox-deploy`)
- **CI:** GitHub Actions — per-component workflows (frontend.yml, api.yml), path-filtered, independent image pushes
- **Pre-commit:** ruff, mypy, eslint all wired as hooks

## Team
- **Mark** (Markgugg) — UI intern, primary contributor on this repo

## Current Focus / Sprint
Sprint 7 (just completed):
- Google OAuth fix (callback 500 error, session state alignment)
- Bot lifecycle tooling (delete, status transitions)
- Dashboard Launchpad redesign (featured banner carousel, quick-access cards, grid/list view)
- Brain Vault UI polish and mobile optimization
- CI/lint alignment (ruff + mypy hooks matching CI)

Active: Dashboard Launchpad is the freshest change (in progress on main).

## Repo / Codebase Notes
Monorepo: `frontend/`, `api/`, `core/`, `docs/`. Services release independently.
- `frontend/src/pages/` — page-level components; `DashboardPage`, `BrainVaultPage` are active work areas
- `frontend/src/lib/bots.ts` — all bot API calls (listBots, setBotStatus, deleteBot, listWorkspaceKnowledgeSources)
- `frontend/src/context/auth.tsx` — workspace/user context (`useAuth`, `currentWorkspace`)
- `frontend/src/components/icons.tsx` — all icon exports (don't create new ones, map to existing)
- Off-limits pages: `ChatHistoryPage`, `TemplatesPage` (Coming Soon)
- Git workflow: **never commit to main** — always feature branch → PR → Staging

## Other Context
- PRs target `Staging`, not main (internship rule enforced in CLAUDE.md)
- Branch naming: `feature/...` or `fix/...`
- Design tokens live in `tokens.css`; glass-morphism aesthetic throughout
- No per-bot conversation metrics in the API — knowledge health is workspace-level only
