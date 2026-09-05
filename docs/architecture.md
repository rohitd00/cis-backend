# Architecture

## Overview

A monorepo with two apps sharing nothing but an HTTP contract:

```text
apps/api/   NestJS + Prisma + PostgreSQL — the backend, and the focus of this project
apps/web/   Next.js (App Router) — a thin client that only calls the API over HTTP
```

The frontend never imports backend code and never queries the database directly. Every
number the frontend renders came from an API response. This boundary is deliberate: the
brief evaluates backend architecture, and a real client/server boundary is part of that
architecture, not incidental to it.

## Request Lifecycle (Ingestion)

```text
Client
  |
  v
NestJS Controller  (CompensationController.create)
  |
  v
DTO Validation     (class-validator, whitelist + forbidNonWhitelisted)
  |                — rejects unknown fields (e.g. a client-supplied totalCompensation)
  v
CompensationService.create
  |
  +--> NormalizationService     (company/role/level/location -> normalized keys)
  +--> Prisma upserts           (find-or-create Company/Role/Level/Location)
  +--> CompensationCalculatorService (Decimal arithmetic: base + bonus + stock)
  +--> DuplicateDetectionService (SHA-256 fingerprint of normalized identity fields)
  |
  v
Prisma $transaction (all of the above, atomically)
  |
  v
PostgreSQL          (fingerprint has a UNIQUE constraint — duplicate enforcement
  |                  is a DB guarantee, not only an application-level check)
  v
Response            { data: {...} }  or  409 Conflict  or  400 { errors: [...] }
```

Bulk ingestion (`POST /ingestion/compensation/bulk`) is `IngestionService` looping over
records and calling the *same* single-record pipeline per record (each in its own
transaction), rather than a separate, less-validated bulk code path. A malformed or
duplicate record is counted and skipped; it never aborts the batch.

## Request Lifecycle (Query)

```text
Client
  |
  v
QueryCompensationDto   (whitelisted query params; sort field checked against an
  |                      explicit allowlist — never interpolated into SQL/Prisma directly)
  v
CompensationService.findMany
  |
  v
Prisma (WHERE + ORDER BY + SKIP/TAKE built from the validated query)
  |
  v
PostgreSQL             (filtering, sorting, and pagination all happen here —
  |                      the API never loads the full table into Node.js)
  v
{ data: [...], pagination: {...} }
```

## Modules (apps/api/src)

```text
prisma/          PrismaService — a single shared client, connected once at boot
normalization/   NormalizationService — deterministic text normalization (no fuzzy/AI matching)
compensation/    CompensationService, CompensationCalculatorService,
                 DuplicateDetectionService, DTOs, controller
ingestion/       IngestionService (bulk orchestration), controller
companies/       CompaniesService (list, detail + per-currency statistics), controller
analytics/       AnalyticsService (overview, compare), compensation-stats.util (raw SQL
                 for median via percentile_cont — see docs/data-model.md)
health/          liveness/readiness check including a live DB query
common/          shared DTOs (pagination), constants (currency/sort allowlists),
                 the global exception filter
```

Controllers only translate HTTP <-> DTOs <-> service calls; there is no direct Prisma
usage inside a controller anywhere in the codebase.

## Error Handling

A single global `AllExceptionsFilter` normalizes every error response to
`{ statusCode, message, errors }`. It maps Prisma's `P2002`/`P2025` to 409/404, passes
through NestJS `HttpException`s as-is, and collapses everything else to a generic 500 —
stack traces, SQL, and connection strings never reach the client (they're still written
to the server log via NestJS's `Logger`).

## Rate Limiting

`@nestjs/throttler` is applied globally with a generous default (300 req/min), and
overridden more strictly on the two write endpoints that matter most:
`POST /compensation` (30/min) and `POST /ingestion/compensation/bulk` (5/min). Read
endpoints are not meaningfully more dangerous to hammer than any other read API, so they
keep the generous default rather than gaining bespoke limits.

## What Was Deliberately Not Built

See `docs/decisions.md` and `docs/research.md` for the reasoning — in short: no
authentication system, no currency conversion, no caching layer (Redis, etc.), no
message queue, and no microservice split. A single well-indexed PostgreSQL database
behind a modular NestJS app comfortably serves this MVP's scale and requirements.
