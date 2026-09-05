# Architectural Decisions

Each entry: **Decision → Reason → Tradeoff.**

### Why PostgreSQL?
Relational integrity (foreign keys, unique constraints) is exactly what duplicate
detection and normalized company/role/level/location matching need, plus
`percentile_cont` gives median for free. **Tradeoff:** none meaningful at this scale;
a document store would have made the unique constraints and joins harder, not easier.

### Why Prisma?
Type-safe queries matched to the TypeScript codebase, first-class `Decimal` support for
money, and a migration workflow that satisfies the "must work from a clean database"
requirement. **Tradeoff:** raw SQL is still needed for `percentile_cont` (median) —
isolated to one file (`compensation-stats.util.ts`), parameterized, and documented.

### Why NestJS?
Its module/controller/service/DTO separation directly maps onto the spec's required
architecture (thin controllers, business logic in services, DTO validation at the
boundary) without needing to hand-roll that structure. **Tradeoff:** more boilerplate
than a minimal Express app for a project this size — accepted because the spec
explicitly asks for demonstrated separation of concerns.

### Why separate Company / Role / Level / Location entities (not string columns)?
Enables (a) a single canonical row per entity for normalization/dedup to target, (b)
cheap indexed aggregation instead of `GROUP BY` on raw text, (c) `Level` scoped per
company via a composite unique key, which is the actual mechanism that keeps "Google
L4" and "Microsoft 62" distinct without special-case code. **Tradeoff:** ingestion does
4 upserts before the compensation insert instead of 1 plain insert — acceptable given
it all happens in one transaction and these are indexed point lookups.

### Why store base/bonus/stock separately (not just total)?
The spec requires it, and it's the only way "missing bonus/stock defaults to 0" and
"total is never client-supplied" can both be enforced — if only the total were stored,
there'd be nothing to validate the total *against*. **Tradeoff:** none; this is strictly
more information for the same or less storage complexity than a single blended field.

### Why calculate total compensation server-side, always?
The client is explicitly never trusted with the authoritative total (spec requirement).
The DTO doesn't even have a `totalCompensation` field, and `whitelist: true` +
`forbidNonWhitelisted: true` means a request that includes one is rejected outright
(400) rather than silently ignored. **Tradeoff:** none — this is a pure integrity win.

### Why Decimal instead of number for money?
JS floating-point arithmetic can silently lose cents on addition (the classic
`0.1 + 0.2` problem), which is unacceptable for compensation figures people compare
decisions against. `Prisma.Decimal` (backed by `decimal.js`) is used for every money
calculation. **Tradeoff:** slightly more verbose arithmetic (`.plus()` instead of `+`) —
worth it for correctness.

### How duplicates are identified
A SHA-256 fingerprint of normalized identity fields (company, role, level, location,
currency, base, bonus, stock, experience, source), enforced with a DB-level unique
constraint on top of an application-level pre-check. **Tradeoff:** two submissions that
are "the same job" but differ in any identity field (e.g. experience years reported
slightly differently) are treated as distinct records rather than merged — a
deliberately conservative choice; silently merging records that might legitimately
differ would be worse than an occasional near-duplicate.

### How company names are normalized
Deterministic, rule-based: trim → lowercase → strip punctuation → strip trailing legal
suffixes (`inc`, `ltd`, `llc`, `corp`, ...) matched as whole tokens only, never
substrings (so "Costco" is never mistaken for "Co" + "sto"). **Not** fuzzy or AI-based,
per spec. **Tradeoff:** genuinely different companies that happen to share a normalized
form after suffix-stripping would collide (no real-world examples found in testing);
two totally different spellings of the same company (typos, abbreviations) are *not*
merged — accepted per spec's explicit instruction not to build "an enormous
fuzzy-matching AI system."

### Why currency conversion is not implemented
The spec explicitly forbids inventing exchange rates and forbids presenting different
currencies as directly comparable. Rather than build a conversion system whose exchange
rate would itself need to be sourced, dated, and trusted, comparison
(`GET /compare`) simply **requires** a single currency parameter, and company
statistics are **always** broken out per currency rather than blended. **Tradeoff:** a
user cannot get one blended "Google vs Microsoft" number spanning USD and INR offices —
this is treated as a feature (avoiding a misleading number), not a limitation.

### Why authentication is not core to the MVP
The spec states this explicitly for Track B's backend focus. Every write endpoint is
still rate-limited (`@nestjs/throttler`) as a lightweight abuse mitigation, and CORS is
configured to a specific origin rather than `*`. **Tradeoff:** the ingestion endpoints
are open in this MVP; a real deployment would need an API key or auth layer in front of
them before accepting untrusted public writes — noted in `README.md`'s Known
Limitations.

### Why no Redis/queue/microservices
None of these solve a problem this MVP actually has. A single PostgreSQL instance with
the indexes described in `docs/data-model.md` comfortably serves "several thousand
records" per the spec's own performance target. **Tradeoff:** none at this scale;
revisit only if a real deployment's read/write volume actually demands it.
