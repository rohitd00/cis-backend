# Claude Code Implementation Prompt

You are the primary implementation engineer for this project.

You have been provided with:

1. **The original internship task document**
2. **The Compensation Intelligence System — Engineering PRD & Implementation Specification**
3. **The existing project repository**

Your job is to turn these requirements into a complete, working, production-oriented MVP.

---

# 1. SOURCE OF TRUTH

Treat the documents in this priority order:

### Priority 1 — Original Internship Task

The original internship task is the ultimate source of truth for:

* What role was selected
* What track was selected
* Mandatory requirements
* Evaluation criteria
* Required technology stack
* Research requirements
* Submission requirements
* Explicit restrictions
* What the company expects from the candidate

Do NOT contradict the original task.

The selected assignment is:

> **Role: Backend Engineer**
> **Track: Track B — Compensation Intelligence System**

The original task explicitly evaluates the backend on:

* Salary ingestion
* Filtering
* Company aggregation
* Compensation comparison
* Company-name normalization
* Total compensation calculation
* Invalid-data rejection
* Duplicate handling
* Missing bonus/stock handling
* Schema quality
* API architecture
* Validation
* Reliability

---

### Priority 2 — Engineering PRD

The provided Engineering PRD translates the assignment into an implementation specification.

Use it as the primary implementation blueprint.

It contains:

* Architecture
* Database design
* API requirements
* Validation rules
* Business logic
* Frontend scope
* Testing requirements
* Documentation
* Deployment expectations
* Definition of done

Follow it unless doing so would directly contradict the original internship task.

---

### Priority 3 — Existing Repository

The existing repository determines what code already exists.

Before changing anything:

* Inspect the repository.
* Understand the existing structure.
* Identify the current framework and tooling.
* Identify existing functionality.
* Identify reusable components.
* Identify existing dependencies.
* Identify existing environment configuration.
* Identify existing database configuration.
* Identify existing deployment configuration.

Do NOT blindly replace the existing project.

Reuse good existing code where appropriate.

If the repository is empty, initialize it according to the PRD.

---

# 2. IMPORTANT: DO NOT START CODING IMMEDIATELY

Your first task is **analysis and planning**, not implementation.

Before writing significant code:

### Step 1

Inspect the entire repository structure.

### Step 2

Read the original internship task carefully.

### Step 3

Read the Engineering PRD carefully.

### Step 4

Compare:

```text
Original Task
        ↓
Engineering PRD
        ↓
Existing Repository
```

Identify:

* Requirements already satisfied
* Requirements partially satisfied
* Requirements missing
* Existing code that can be reused
* Existing code that should be refactored
* Potential conflicts
* Technical risks
* Ambiguities

### Step 5

Create an implementation plan.

The plan should be concrete enough that another engineer could execute it.

---

# 3. BEFORE IMPLEMENTATION — SHOW THE PLAN

Before making substantial changes, provide a concise implementation plan containing:

## A. Repository Assessment

Explain:

* Current stack
* Current architecture
* Existing database setup
* Existing frontend
* Existing backend
* Existing deployment setup

## B. Gap Analysis

Create a table:

| Requirement | Current State | Required Change | Priority |
| ----------- | ------------- | --------------- | -------- |

Prioritize requirements:

* P0 — Mandatory
* P1 — Important
* P2 — Nice to have

## C. Proposed Architecture

Explain:

* Backend modules
* Database structure
* API structure
* Frontend structure
* Data flow
* Ingestion flow
* Validation flow
* Normalization flow

## D. Implementation Phases

Provide a sequential implementation plan.

Do not overcomplicate the plan.

---

# 4. DO NOT ASK UNNECESSARY QUESTIONS

You are expected to operate with high ownership.

The original task explicitly evaluates the ability to:

* Figure things out independently
* Navigate ambiguity
* Make decisions without waiting for instructions
* Push through technical challenges

Therefore:

If a reasonable implementation decision can be made from the documents and repository, make the decision yourself.

Do not stop and ask for permission for every minor implementation detail.

Only ask a question if:

1. There are two genuinely conflicting requirements,
2. The decision could fundamentally change the product,
3. The required information cannot reasonably be inferred.

Otherwise:

> Make the simplest reasonable decision and document it.

---

# 5. IMPLEMENTATION PRIORITY

Implement in this order.

## P0 — Core Backend

1. PostgreSQL
2. Prisma
3. Database schema
4. Company normalization
5. Role normalization
6. Compensation model
7. Validation
8. Total compensation calculation
9. Duplicate detection
10. Single-record ingestion
11. Bulk ingestion
12. Filtering
13. Pagination
14. Sorting
15. Company aggregation
16. Compensation comparison

## P1 — Backend Quality

17. API versioning
18. Swagger/OpenAPI
19. Error handling
20. Health endpoint
21. Database indexes
22. Transactions
23. Logging
24. Unit tests
25. Integration tests

## P1 — Product Surface

26. Compensation explorer
27. Company pages
28. Comparison page
29. Dashboard
30. Loading states
31. Error states
32. Empty states

## P1 — Documentation

33. README
34. Research document
35. Architecture document
36. Data model document
37. Architecture decisions

## P2 — Optional

Only implement these if the P0/P1 requirements are already strong:

* Charts
* Admin ingestion UI
* Rate limiting
* Additional analytics

Do NOT sacrifice core backend quality to implement optional features.

---

# 6. BACKEND-FIRST MINDSET

This is a **Backend Engineer** submission.

Do not optimize the project around visual polish.

The most impressive part of the project should be:

```text
Data
 ↓
Validation
 ↓
Normalization
 ↓
Duplicate Detection
 ↓
Business Logic
 ↓
Database
 ↓
Aggregation
 ↓
REST APIs
 ↓
Frontend
```

The frontend exists primarily to demonstrate that the backend works.

---

# 7. DATABASE REQUIREMENTS

Use:

* PostgreSQL
* Prisma
* Decimal for monetary values

The schema should model at minimum:

```text
Company
Role
Level
Location
Compensation
```

Maintain proper relationships.

Use:

* Foreign keys
* Unique constraints
* Appropriate indexes
* Database-level integrity

Do not create a single giant denormalized salary table unless there is a compelling documented reason.

---

# 8. MONEY REQUIREMENTS

Never use floating-point arithmetic for authoritative monetary calculations.

Use Prisma/PostgreSQL Decimal.

Store separately:

```text
baseSalary
bonus
stock
totalCompensation
```

Calculate:

```text
totalCompensation =
    baseSalary +
    bonus +
    stock
```

Missing:

```text
bonus → 0
stock → 0
```

The client must never be trusted to provide the authoritative total compensation.

The backend calculates it.

---

# 9. VALIDATION REQUIREMENTS

Validate all external input.

At minimum:

### Required

* Company
* Role
* Level
* Currency
* Base salary

### Optional

* Bonus
* Stock
* Experience
* Region

### Numeric rules

```text
baseSalary >= 0
bonus >= 0
stock >= 0
experience >= 0
```

Invalid data must be rejected.

Do not allow malformed input to reach the database.

Return useful structured validation errors.

---

# 10. COMPANY NORMALIZATION

Implement deterministic company-name normalization.

Example:

```text
" Google "
"GOOGLE"
"google inc."
"Google, Inc."
```

should normalize consistently where appropriate.

Create a dedicated service for this.

Do not bury normalization logic inside controllers.

Write tests for normalization.

Do not build an unnecessarily sophisticated AI/fuzzy-matching system.

---

# 11. DUPLICATE HANDLING

Duplicate detection is mandatory.

Create a documented deterministic duplicate strategy.

Normalize relevant string fields before duplicate comparison.

Use database constraints where appropriate in addition to application-level checks.

A duplicate should not silently create another identical compensation record.

Return an appropriate response/status.

---

# 12. INGESTION

Implement:

```http
POST /api/v1/compensation
```

and:

```http
POST /api/v1/ingestion/compensation/bulk
```

The ingestion pipeline should conceptually be:

```text
Request
 ↓
DTO Validation
 ↓
Normalization
 ↓
Default Values
 ↓
Business Validation
 ↓
Duplicate Detection
 ↓
Total Compensation Calculation
 ↓
Database Transaction
 ↓
Response
```

Bulk ingestion must report:

* Total
* Inserted
* Duplicates
* Rejected
* Errors

Do not implement bulk insertion as an unvalidated blind database write.

---

# 13. QUERY API

Implement:

```http
GET /api/v1/compensation
```

Support filtering by:

* Company
* Role
* Level
* Country
* Region
* City
* Currency
* Base salary range
* Total compensation range
* Experience range

Support:

* Pagination
* Sorting

Filtering and pagination must happen at the database/query level.

Do NOT fetch the entire dataset and filter it in JavaScript.

---

# 14. SORTING SECURITY

Only allow sorting by known fields.

For example:

```text
baseSalary
bonus
stock
totalCompensation
experienceYears
reportedAt
```

Do not directly inject arbitrary client-provided values into database queries.

---

# 15. COMPANY AGGREGATION

Implement company-level statistics.

At minimum:

* Record count
* Average base
* Median base
* Average total
* Median total
* Minimum total
* Maximum total

Where practical, perform aggregation in PostgreSQL.

Avoid unnecessarily loading all records into Node.js.

---

# 16. COMPARISON

Implement a compensation comparison API.

The comparison should consider:

* Company
* Role
* Level
* Location
* Currency

Return comparable statistics.

Do not silently compare incompatible currencies.

If currencies differ, either:

* Require matching currencies, or
* Clearly separate results by currency.

Do not invent exchange rates.

---

# 17. API ARCHITECTURE

Use:

```text
/api/v1/...
```

Use REST-style resources.

Controllers should remain thin.

Preferred flow:

```text
Controller
 ↓
DTO Validation
 ↓
Service
 ↓
Business Logic
 ↓
Prisma
 ↓
PostgreSQL
```

Do not place substantial business logic inside controllers.

Do not put database queries directly into React components.

---

# 18. ERROR HANDLING

Use consistent error responses.

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": []
}
```

Use appropriate HTTP status codes.

Do not expose:

* Stack traces
* SQL
* Database credentials
* Internal secrets
* Infrastructure details

---

# 19. PERFORMANCE

The MVP should comfortably handle several thousand records.

At minimum:

* Database-level filtering
* Database-level pagination
* Appropriate indexes
* Avoid N+1 queries
* Avoid unnecessary columns
* Avoid loading huge datasets into memory

Do not introduce Redis, Elasticsearch, Kafka, queues, or microservices without a concrete requirement.

A well-designed PostgreSQL + Prisma architecture is sufficient for this project.

---

# 20. SYNTHETIC DATA

Use synthetic/demo data.

Do NOT scrape competitor websites.

Do NOT represent fabricated salary numbers as verified real-world salary claims.

Seed enough data to demonstrate:

* Filtering
* Pagination
* Aggregation
* Comparison
* Different companies
* Different roles
* Different levels
* Different locations
* Different currencies

Clearly label the data as synthetic/demo data.

---

# 21. FRONTEND

Build a functional but restrained frontend.

Required areas:

### Dashboard

Show:

* Total companies
* Total compensation records
* Popular companies
* Popular roles
* Search

### Compensation Explorer

Provide:

* Search
* Filters
* Sorting
* Pagination
* Compensation table

### Company Page

Show:

* Company
* Statistics
* Roles
* Levels
* Locations
* Compensation records

### Comparison

Allow comparison of compensation across companies using compatible criteria.

Do not spend disproportionate effort on animations.

---

# 22. DOCUMENTATION

Create and maintain:

```text
README.md

docs/
├── research.md
├── architecture.md
├── data-model.md
└── decisions.md
```

Documentation should describe the actual implementation.

Do not write documentation for features that were never implemented.

---

# 23. RESEARCH

The original task requires research into:

* Levels.fyi
* 6figr
* AmbitionBox
* Glassdoor

Complete this research before finalizing product decisions.

Create:

```text
docs/research.md
```

Include:

```markdown
# Key Observations

...

# Feature Comparison

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | Build? |
|---|---|---|---|---|---|
```

Do not blindly copy competitor functionality.

Use the research to justify what the MVP does and does not include.

---

# 24. TESTING

At minimum, create tests for:

### Company normalization

Examples:

```text
Google
google
GOOGLE
Google, Inc.
Google Inc.
```

### Compensation calculation

```text
base + bonus + stock
```

### Missing values

```text
missing bonus → 0
missing stock → 0
```

### Validation

Test:

* Missing company
* Missing role
* Missing level
* Invalid currency
* Negative salary
* Negative bonus
* Negative stock

### Duplicate handling

Submit equivalent records and verify duplicate behavior.

### APIs

Test:

* POST compensation
* POST bulk ingestion
* GET compensation
* GET company
* GET analytics
* GET comparison

---

# 25. CODE QUALITY

Use strict TypeScript.

Avoid `any` unless there is a strong reason.

Prefer explicit types.

Do not over-abstract.

Do not create classes/interfaces simply for the appearance of architecture.

Every abstraction should solve an actual problem.

Use meaningful names.

Keep functions focused.

---

# 26. SECURITY

At minimum:

* Validate all input
* Protect against SQL injection
* Allowlist sort fields
* Restrict page size
* Keep secrets in environment variables
* Configure CORS
* Avoid leaking internal errors

Do not implement unnecessary security infrastructure.

---

# 27. ENVIRONMENT

Create:

```text
.env.example
```

Include required variables such as:

```text
DATABASE_URL=
PORT=
NODE_ENV=
```

Never commit real secrets.

---

# 28. FINAL VERIFICATION

Before declaring the project complete, run:

```text
TypeScript checks
Lint
Tests
Prisma validation
Production build
```

Fix significant issues.

Verify:

```text
Fresh install
 ↓
Environment configuration
 ↓
Database migration
 ↓
Database seed
 ↓
Backend startup
 ↓
Frontend startup
 ↓
API requests
 ↓
Production build
```

all work.

---

# 29. FINAL SELF-REVIEW

Before finishing, review the implementation as a hiring engineer.

Ask:

### Database

* Is the schema properly normalized?
* Are relationships correct?
* Are constraints appropriate?
* Are indexes justified?

### Data

* Is company normalization reliable?
* Are duplicates handled?
* Are invalid records rejected?
* Are missing bonus/stock values handled correctly?
* Is total compensation calculated correctly?

### APIs

* Are endpoints coherent?
* Is validation implemented?
* Is filtering done in the database?
* Is pagination safe?
* Is sorting allowlisted?
* Are errors consistent?

### Performance

* Any N+1 queries?
* Any unnecessary full-table loads?
* Any unnecessarily expensive operations?

### Architecture

* Are controllers thin?
* Is business logic in services?
* Is database access isolated?
* Is the code easy to explain?

### Product

* Can a user explore compensation?
* Can they filter it?
* Can they compare companies?
* Can they understand the results?

---

# 30. DO NOT GAME THE ASSIGNMENT

This is important.

Do NOT optimize for merely making the application look impressive.

Do NOT:

* Fake backend functionality
* Hardcode API responses
* Hardcode frontend datasets
* Hide broken features behind UI
* Claim unsupported functionality
* Copy competitor data
* Generate fake external sources
* Add meaningless complexity
* Create unnecessary microservices
* Use prohibited prompt-to-app generators

The original task explicitly permits AI-assisted coding, but the developer must understand the resulting implementation and be able to explain the architecture.

The final implementation must therefore be technically defensible.

---

# 31. DEFINITION OF SUCCESS

The project should make a backend engineer reviewing it conclude:

> The developer understands relational database design.

> The developer understands API architecture.

> The developer understands runtime validation.

> The developer understands data normalization.

> The developer understands duplicate detection and data integrity.

> The developer understands filtering and aggregation.

> The developer thinks about reliability and edge cases.

> The developer can explain why the system was designed this way.

---

# 32. WORKING STYLE

Work incrementally.

After each meaningful phase:

1. Implement
2. Run relevant checks/tests
3. Fix errors
4. Review the result
5. Continue

Do not generate thousands of lines of code without verifying them.

Do not leave obvious TypeScript errors, lint errors, broken imports, or failing migrations for the end.

Prefer small, verifiable changes.

---

# 33. WHEN YOU FINISH

Provide a final report containing:

## Implementation Summary

What was built.

## Architecture

How the major components interact.

## Database

Tables, relationships, indexes, and constraints.

## APIs

List all implemented endpoints.

## Data Quality

Explain:

* Validation
* Normalization
* Duplicate handling
* Compensation calculation

## Testing

What was tested and the result.

## Running Locally

Exact commands.

## Deployment

How the application can be deployed.

## Known Limitations

Be honest.

Do not claim something is production-ready if it is only MVP-level.

## Recommended Next Steps

Only include realistic improvements.

---

# FINAL DIRECTIVE

You are not merely generating code.

You are implementing an engineering project that will be reviewed by backend engineers.

Optimize for:

**Correctness > Architecture quality > Reliability > Maintainability > Features > Visual polish**

Read the original assignment and Engineering PRD carefully before making implementation decisions.

Inspect the existing repository before modifying it.

First produce the implementation plan and gap analysis.

Then implement the project incrementally.

Do not stop unnecessarily for minor decisions.

Make reasonable engineering decisions independently and document important tradeoffs.

At every stage, ensure the implementation remains aligned with the original internship assignment.
