# Competitive Research — Compensation Data Products

This research was conducted by reviewing the public-facing product experience of each
platform (general product knowledge / publicly documented behavior) — **no site was
scraped, and no salary data or copyrighted content from any of these products was
copied into this project.** All data used in this system is synthetic (see
`README.md`).

## Key Observations

### Levels.fyi (primary reference)
- The core insight that shapes this entire project: **levels, not job titles, are the
  unit of comparison.** "Software Engineer" alone is not a comparable data point — the
  same title spans a huge compensation range depending on seniority.
- Levels are company-specific and explicitly *not* assumed equivalent across companies
  (Google L4 ≠ Microsoft 62 ≠ Amazon SDE II), though a rough internal seniority mapping
  is used to let users sort/compare loosely across companies.
- Compensation is broken into base / bonus / stock, with total compensation shown as a
  derived, not independently editable, figure.
- Company pages aggregate submissions into distributions and percentiles rather than
  showing every raw row as the primary view.
- Filtering is the primary interaction (company, role, level, location, years of
  experience) rather than free-text search.

### 6figr
- Similar structure to Levels.fyi but with a stronger mobile/community angle (anonymous
  discussion tied to compensation posts).
- Leans more on user-submitted, less-verified data with lighter-weight structure —
  useful as a reminder that verification/moderation is a real, unsolved problem this
  MVP explicitly does not attempt to solve (see `docs/decisions.md`).

### AmbitionBox
- Oriented around company reviews with compensation as one of several signals
  (alongside ratings, interview experiences, culture reviews). Compensation data is
  presented per-role, often without a strict level system — closer to a job-title-based
  salary range lookup than a level-based system.
- Strong India focus, which is reflected in this project's synthetic seed data
  including a substantial number of Indian companies, cities, and INR-denominated
  records.

### Glassdoor
- Broadest scope of the four (reviews, salaries, job listings, interview questions).
  Salary data is presented as ranges per job title per company/location, generally
  without an explicit levels concept — again closer to AmbitionBox's model than
  Levels.fyi's.
- Demonstrates the risk of comparing salaries by title alone: ranges are often wide
  enough to be of limited decision-making value, reinforcing the "levels matter more
  than job titles" principle this project adopts from Levels.fyi.

## Feature Comparison

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | Build? |
|---|---|---|---|---|---|
| Level-based (not just title-based) comparison | Yes | Yes | No | No | **Yes** — core to this project |
| Company-scoped level labels (not globally equated) | Yes | Partial | N/A | N/A | **Yes** |
| Base/bonus/stock breakdown | Yes | Yes | Partial | Rarely | **Yes** |
| Server-calculated total compensation | Yes (implied) | Yes (implied) | N/A | N/A | **Yes** |
| Location-based filtering | Yes | Yes | Yes | Yes | **Yes** |
| Company aggregate statistics (avg/median) | Yes | Yes | Partial | Yes | **Yes** |
| Cross-company comparison view | Yes | Limited | No | No | **Yes** (single-currency only) |
| Currency conversion for cross-currency comparison | No (kept separate) | No | N/A (mostly single-market) | No | **No** — see `docs/decisions.md` |
| User-submitted data with moderation/verification | Yes | Yes (lighter) | Yes | Yes | **No** — out of scope for this MVP |
| Company reviews / culture ratings | No | No | Yes | Yes | **No** — not a compensation feature |
| Job listings / recruitment | No | No | Yes | Yes | **No** — explicit non-goal |
| Discussion / Q&A | No | Yes | Yes (via reviews) | Yes | **No** — explicit non-goal |
| Authentication / saved items | Yes | Yes | Yes | Yes | **No** — not core to a backend-focused MVP |
| Admin/bulk ingestion tooling | Not public | Not public | Not public | Not public | **Yes** (`POST /ingestion/compensation/bulk`) — needed to seed structured demo data reliably |

## What This MVP Deliberately Does Not Copy

- **No scraped or copied salary datasets.** Every compensation record is synthetically
  generated (see `apps/api/prisma/seed.ts`) and labeled as such throughout the UI.
- **No review/rating system, job board, or discussion features** — these are explicit
  non-goals per the engineering spec; adding them would dilute focus from the backend
  data/API quality this project is evaluated on.
- **No invented currency conversion.** Several of these products operate mostly within
  one currency market; where this project spans multiple currencies (by design, to
  demonstrate correct handling), it never converts between them — see
  `docs/decisions.md` for the reasoning.
