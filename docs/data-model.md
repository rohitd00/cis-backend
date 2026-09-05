# Data Model

Schema source of truth: `apps/api/prisma/schema.prisma`.

## Tables

### `companies`
| Column | Type | Notes |
|---|---|---|
| id | text (cuid) | PK |
| name | text | canonical display name (first-seen casing/spelling) |
| normalizedName | text | **unique** — deterministic dedup key (see Normalization below) |
| slug | text | **unique** — URL-safe identifier, e.g. `google` |
| website | text? | optional |

### `roles`
Same shape as `companies` (`name` / `normalizedName` unique / `slug` unique). Roles are
**not** semantically merged — "Software Engineer" and "Backend Engineer" are always
distinct rows, by design (see `docs/decisions.md`).

### `levels`
| Column | Type | Notes |
|---|---|---|
| id | text (cuid) | PK |
| companyId | text | FK -> companies, `onDelete: Cascade` |
| name | text | raw label as used by the company, e.g. `"L4"`, `"62"`, `"SDE II"` |
| normalizedName | text | for per-company dedup only |
| seniorityRank | int? | optional, manually curated, coarse cross-company ordering hint |

**Levels are scoped to a company** (`@@unique([companyId, normalizedName])`), not
global. This is the schema's answer to the spec's requirement that "Google L4" and
"Microsoft 62" never collapse into the same row just because they're both level-shaped
strings — the composite key means they can't, without needing any special-case logic
anywhere else in the codebase.

### `locations`
| Column | Type | Notes |
|---|---|---|
| id | text (cuid) | PK |
| country | text | display value |
| region, city | text? | display values, both optional |
| normalizedCountry | text | matching key |
| normalizedRegion, normalizedCity | text | **default `""`**, not null — see below |

`@@unique([normalizedCountry, normalizedRegion, normalizedCity])`. The normalized
region/city default to empty string rather than `null` specifically because PostgreSQL
treats `NULL` as distinct from any other `NULL` in a unique index — two "India, (no
region), (no city)" rows would otherwise both satisfy uniqueness and silently
duplicate. Defaulting to `""` makes the composite key behave like a real key.

### `compensations`
| Column | Type | Notes |
|---|---|---|
| id | text (cuid) | PK |
| companyId, roleId, levelId, locationId | text | FKs, `onDelete: Restrict` (a compensation record must never be able to reference a deleted parent) |
| currency | text | validated against an explicit allowlist at the DTO layer |
| baseSalary, bonus, stock, totalCompensation | **Decimal(14,2)** | never `number`/float |
| experienceYears | float? | not a monetary value; float precision is fine here |
| source | text | default `"synthetic"` |
| fingerprint | text | **unique** — see Duplicate Strategy below |
| reportedAt | timestamp | defaults to submission time |

Indexes: `companyId`, `roleId`, `levelId`, `locationId`, `currency`,
`totalCompensation`, `baseSalary`, and a composite `(companyId, roleId, levelId,
locationId)` for the common "compensation for role+level+location at a company" query
shape. These are the columns the query/filter/comparison APIs actually filter or sort
on — no column is indexed speculatively.

## Why This Shape Instead of One Denormalized Table

Company/Role/Level/Location are separate tables (not just string columns on
`compensations`) because:
1. They're independently reused across many compensation rows — a shared identity
   (via a single `companyId`) is what makes company-level aggregation
   (`GET /companies/:slug`) a cheap indexed query instead of a `GROUP BY` on raw text.
2. Duplicate detection and normalization each need a single, canonical place to live —
   normalizing text is only correct if there's one row to normalize it into.
3. It matches the spec's explicit instruction: "Do not create a single giant
   denormalized salary table."

## Monetary Representation

`baseSalary`, `bonus`, `stock`, `totalCompensation` are all Prisma/PostgreSQL
`Decimal(14,2)`. Arithmetic on them happens through `Prisma.Decimal`
(`CompensationCalculatorService`), never native JS `number`, so no floating-point
rounding error can enter a stored monetary value. `experienceYears` is a `Float`
because it isn't authoritative money and float precision is adequate for "2.5 years".

## Duplicate Strategy

`Compensation.fingerprint` is a SHA-256 hash (`DuplicateDetectionService`) of the
normalized identity fields: company, role, level, location (country/region/city),
currency, base, bonus, stock, experience, source. Two submissions that normalize to the
same values (`"GOOGLE"` vs `"Google, Inc."`, differing only in casing/whitespace)
produce the same fingerprint and are rejected as duplicates.

The column carries a database `UNIQUE` constraint — duplicate rejection is enforced by
PostgreSQL itself, not only by the `findUnique` check `CompensationService` performs
before inserting. That check exists so the API can return a clean `409 Conflict`
instead of surfacing a raw constraint-violation error, but even if two requests raced
past that check simultaneously, the database would still refuse the second insert.

## Aggregation

`average`/`median`/`min`/`max` statistics (`compensation-stats.util.ts`) are computed in
PostgreSQL via a single parameterized raw query using `percentile_cont(0.5)` for
medians — Prisma's query builder has no median primitive, so raw SQL is used
specifically for that, isolated to one file, with every value passed as a bound
parameter (never string-interpolated). No compensation rows are pulled into Node.js to
compute these numbers.

**Statistics are always broken out per currency and never blended.** A company with
both a US and an India office will show separate USD and INR statistics rather than one
number that silently averages ₹40,00,000 with $150,000.
