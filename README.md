# Uptrace

Uptrace is a monorepo for an observability and monitoring application built with TypeScript. The repository contains a backend API, a Next.js dashboard, and a shared Drizzle/Postgres data package. The platform supports user authentication, organization and project scoping, telemetry ingestion, metrics and logs, service visibility, and scheduled HTTP checks.

## Overview

This project is organized as a pnpm workspace with three main parts:

- `apps/api` — Express-based API for auth, project/organization management, telemetry ingestion, and dashboard data access
- `apps/web` — Next.js dashboard for managing organizations, projects, API keys, service health, and telemetry views
- `packages/db` — shared database schema and migration tooling built with Drizzle ORM

The application is designed around a project-centric model: users belong to organizations, organizations contain projects, and projects own telemetry data, API keys, and monitoring configuration.

## What is implemented

The repository currently contains these real capabilities:

- User registration, login, refresh, logout, and email verification flows
- Session-based auth with cookies and JWT access tokens
- Organization creation and membership management
- Project creation, listing, updates, and deletion
- Project API key management for authenticated telemetry ingestion
- OTLP trace ingestion at `POST /v1/traces`
- Log ingestion at `POST /v1/logs`
- Metrics ingestion at `POST /v1/metrics`
- Dashboard endpoints for traces, logs, metrics, services, overview, and HTTP monitoring
- Scheduled HTTP endpoint health checks with result storage and status tracking
- User profile management, including name and profile image updates
- Mailing via Brevo for verification emails
- Cloudinary-backed profile image uploads
- Local observability stack with Postgres, Redis, and an OpenTelemetry collector

## Architecture

The project follows a layered monorepo structure:

1. Web application
   - Next.js app router frontend
   - Zustand-based client state
   - Dashboard pages for overview, traces, logs, services, API keys, and settings

2. API application
   - Express server with middleware, authorization, error handling, and route registration
   - DB-backed repositories and services for auth, organizations, projects, telemetry, metrics, logs, and HTTP monitoring
   - OpenTelemetry instrumentation enabled at startup
   - `GET /health` checks database connectivity

3. Shared database package
   - Drizzle schema definitions for users, sessions, organizations, projects, endpoints, traces, spans, metrics, logs, and API keys
   - SQL migrations under `packages/db/drizzle/`

## Tech stack

### Backend
- TypeScript
- Node.js
- Express 5
- PostgreSQL via Drizzle ORM and `postgres`
- JWT via `jose`
- Argon2 password hashing
- Pino logging
- OpenTelemetry SDK and OTLP exporters
- Brevo transactional email
- Cloudinary upload integration
- Helmet, CORS, cookie parsing, and rate limiting

### Frontend
- Next.js 16
- React 19
- Tailwind CSS
- Zustand state management
- Axios for API requests
- Framer Motion and lucide-react for UI elements
- Sonner for notifications

### Infrastructure
- Docker Compose for local Postgres, Redis, and OTel collector
- pnpm workspaces
- Turbo for workspace task orchestration

## Repository layout

```text
.
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── app/
│       ├── lib/
│       ├── stores/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── db/
│       ├── drizzle/
│       ├── src/
│       ├── drizzle.config.ts
│       └── package.json
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml
├── otel-collector/
│   └── otel-collector-config.yml
├── .env.example
├── apps/web/.env.example
├── packages/db/.env.example
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── LICENSE
└── README.md
```

## Local development

### Prerequisites

- Node.js 18 or newer
- pnpm 9
- Docker and Docker Compose

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

The repository includes example environment files, but the actual API also expects several runtime variables that are validated in `apps/api/src/config/env.ts`.

At minimum, set up the following values for local development:

- `DATABASE_URL`
- `WEB_URL`
- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`
- `BREVO_FROM_NAME`
- `JWT_ACCESS_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `OTEL_SERVICE_NAME`
- `OTEL_SERVICE_VERSION`
- `OTEL_ENVIRONMENT`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

The client app also expects:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Example files in the repo:

- `.env.example`
- `apps/web/.env.example`
- `packages/db/.env.example`

### Run infrastructure services

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts:

- PostgreSQL on `localhost:5433`
- Redis on `localhost:6379`
- OTLP receiver on `localhost:4317` and `localhost:4318`

### Run database migrations

```bash
pnpm --dir packages/db db:push
```

or:

```bash
pnpm --dir packages/db db:migrate
```

### Run the app

Start the API and web app in separate terminals:

```bash
pnpm --dir apps/api dev
```

```bash
pnpm --dir apps/web dev
```

Default local URLs:

- Web app: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/health

## API surface

The backend exposes a project-scoped API that includes these route groups:

- Authentication: `/auth`
  - `POST /register`
  - `GET /verify-email`
  - `POST /resend-verification`
  - `POST /login`
  - `POST /refresh`
  - `GET /me`
  - `PATCH /me/name`
  - `POST /me/profile-image`
  - `POST /logout`

- Organizations: `/organizations`
- Projects: `/organizations/:organizationId/projects`, `/projects/:projectId`
- Telemetry: `/v1/traces`, `/projects/:projectId/traces`, `/projects/:projectId/traces/:traceId`
- Logs: `/v1/logs`, `/projects/:projectId/logs`
- Metrics: `/projects/:projectId/metrics`
- Services: `/projects/:projectId/services`
- HTTP monitoring: `/projects/:projectId/http-endpoints`, `/http-endpoints/:endpointId`
- Overview: `/projects/:projectId/overview`

Telemetry ingestion routes use project API keys in the `x-uptrace-api-key` header.

## HTTP monitoring

The project includes a scheduler and worker for checking configured HTTP endpoints. The scheduler syncs active endpoints and runs periodic checks with configurable intervals and timeouts. Results are stored and exposed through the HTTP monitoring API and dashboard.

## Observability and telemetry flow

The application accepts OTLP data and stores trace and span records in Postgres. The included collector configuration forwards traces from the OpenTelemetry collector to the local API at `http://host.docker.internal:4000`, using the configured `x-uptrace-api-key` header.

## Workspace scripts

From the root:

```bash
pnpm build
pnpm dev
pnpm lint
pnpm format
pnpm check-types
```

Package-level scripts are defined in each app package as well, including:

- `apps/api`: `dev`, `build`, `start`, `lint`, `check-types`, `test:http-check`
- `apps/web`: `dev`, `build`, `start`, `lint`, `check-types`
- `packages/db`: `db:generate`, `db:migrate`, `db:push`, `db:studio`

## Notes

- The repository is a real monorepo implementation rather than a placeholder template.
- The product surface is centered around observability and project monitoring workflows.
- Some infrastructure components such as Redis are configured in Docker Compose and are part of the local development stack even though the current source tree primarily demonstrates the API and dashboard behavior around the observability workflows.

## License

This project is licensed under the ISC license. See `LICENSE` for details.
