# Compensation Intelligence System

## Engineering PRD & Implementation Specification

**Role:** Backend Engineer
**Track:** Track B — Compensation Intelligence System
**Primary Goal:** Build a production-oriented MVP demonstrating strong backend architecture, data modeling, validation, normalization, ingestion, aggregation, filtering, and compensation-comparison capabilities.

---

# 1. PROJECT CONTEXT

Build a compensation intelligence platform inspired primarily by Levels.fyi, with secondary reference points from 6figr, AmbitionBox, and Glassdoor.

This is NOT intended to be a clone of any of those products.

The product should focus on **structured and comparable compensation data**.

The central principle is:

> Levels matter more than job titles.

The application should allow users to understand compensation by considering:

* Company
* Role
* Level
* Location
* Base salary
* Bonus
* Stock/equity
* Total compensation
* Experience
* Currency

The project is being evaluated primarily as a **backend engineering project**.

The backend quality is therefore more important than visual complexity.

---

# 2. ASSIGNMENT REQUIREMENTS

The backend must provide APIs for:

* Salary ingestion
* Salary filtering
* Company aggregation
* Compensation comparison

The backend must:

* Normalize company names
* Calculate total compensation
* Reject invalid data
* Handle duplicate entries
* Default missing bonus to 0
* Default missing stock/equity to 0

The implementation will be evaluated on:

* Database schema quality
* Normalization logic
* API architecture
* Validation systems
* Reliability
* Overall engineering quality

Do not solve the assignment by hardcoding data into frontend components.

All compensation data displayed by the frontend must ultimately originate from the backend/database.

---

# 3. ENGINEERING OBJECTIVES

The finished system should demonstrate that the developer understands:

1. Relational database modeling
2. REST API design
3. Input validation
4. Data normalization
5. Data integrity
6. Duplicate detection
7. Aggregation
8. Pagination
9. Filtering
10. Sorting
11. Error handling
12. Separation of concerns
13. Transactional operations
14. Testing
15. Production-oriented architecture

The application does NOT need to implement every feature imaginable.

Prefer:

> Small scope + excellent engineering

over:

> Large scope + shallow implementation

Do not add unnecessary features simply to make the application look bigger.

---

# 4. TECHNOLOGY STACK

Use the following stack.

## Backend

* Node.js
* TypeScript
* NestJS
* REST APIs

## Database

* PostgreSQL
* Prisma ORM

## Frontend

* Next.js
* React
* TypeScript
* TailwindCSS

## Deployment

Target deployment compatibility with:

* Vercel
* Neon / Railway / Render

The application must work locally first.

---

# 5. HIGH-LEVEL ARCHITECTURE

Use a modular architecture.

Recommended backend structure:

```text
src/
├── main.ts
├── app.module.ts
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── utils/
│   └── types/
│
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── companies/
│   ├── companies.module.ts
│   ├── companies.controller.ts
│   ├── companies.service.ts
│   ├── dto/
│   └── entities/
│
├── compensation/
│   ├── compensation.module.ts
│   ├── compensation.controller.ts
│   ├── compensation.service.ts
│   ├── dto/
│   ├── validators/
│   └── entities/
│
├── ingestion/
│   ├── ingestion.module.ts
│   ├── ingestion.controller.ts
│   ├── ingestion.service.ts
│   ├── dto/
│   ├── processors/
│   └── validators/
│
├── analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts
│
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

The exact organization may be adjusted if a better NestJS structure is justified, but maintain clear separation between:

* Controllers
* Services
* DTOs
* Validation
* Database access
* Business logic

Controllers should not contain substantial business logic.

---

# 6. CORE DOMAIN MODEL

The system should be centered around compensation records.

A compensation record represents a salary/compensation observation for a person or anonymous employee.

Example:

```text
Company: Google
Role: Software Engineer
Level: L4
Location: Bangalore
Experience: 3 years
Base: ₹35,00,000
Bonus: ₹5,00,000
Stock: ₹10,00,000
Total: ₹50,00,000
```

The system should store the components separately rather than storing only total compensation.

---

# 7. DATABASE DESIGN

Use PostgreSQL with Prisma.

Create a normalized relational schema.

## 7.1 Company

Fields:

```text
id
name
normalizedName
slug
website
createdAt
updatedAt
```

Requirements:

* `name` is the canonical display name.
* `normalizedName` is used for duplicate detection and matching.
* `slug` is unique.
* `normalizedName` must have a unique constraint.
* Company names must not be duplicated because of capitalization or common formatting differences.

Examples:

```text
Google
google
GOOGLE
Google Inc.
Google, Inc.
```

The system should attempt to map equivalent names to the same company where practical.

Do NOT implement an enormous fuzzy-matching AI system.

Use deterministic normalization first.

---

# 8. COMPANY NAME NORMALIZATION

Implement a dedicated company normalization service.

Example normalization process:

```text
Input:
" Google, Inc. "

↓ trim

"Google, Inc."

↓ lowercase

"google, inc."

↓ remove punctuation

"google inc"

↓ remove common legal suffixes

"google"

↓ normalized representation

"google"
```

Potential suffixes:

```text
inc
inc.
ltd
ltd.
limited
llc
corp
corp.
corporation
co
co.
company
technologies
technology
```

Do not blindly remove meaningful words from legitimate company names.

The normalization system should be deterministic and documented.

Create unit tests for it.

Examples:

```text
Google
GOOGLE
google inc.
Google, Inc.
Google LLC
```

should resolve consistently where appropriate.

---

# 9. LOCATION MODEL

Create a location representation that allows compensation comparison by geography.

At minimum store:

```text
country
state/region
city
```

Prefer a dedicated `Location` table if appropriate.

Example:

```text
Country: India
Region: Karnataka
City: Bangalore
```

and:

```text
Country: United States
Region: California
City: San Francisco
```

Location should be filterable.

---

# 10. ROLE MODEL

Create a structured role representation.

Fields:

```text
id
name
normalizedName
slug
createdAt
updatedAt
```

Examples:

```text
Software Engineer
Backend Engineer
Frontend Engineer
Full Stack Engineer
Data Scientist
Product Manager
DevOps Engineer
Machine Learning Engineer
```

Role normalization should similarly prevent trivial duplicates.

Do not attempt sophisticated semantic role classification.

For example, do not automatically assume:

```text
Software Engineer == Backend Engineer
```

unless explicitly configured.

---

# 11. LEVEL MODEL

Levels are a critical part of the product.

Create a dedicated level representation.

Fields:

```text
id
name
normalizedName
seniorityRank
createdAt
updatedAt
```

Examples:

```text
Intern
Junior
L1
L2
L3
L4
L5
Senior
Staff
Principal
```

The system must NOT assume that the same level name has exactly the same meaning across all companies.

Therefore, compensation records should retain the original level label.

Example:

```text
Google L4
Microsoft 62
Amazon SDE II
```

should remain distinguishable.

Optionally allow a normalized seniority rank for broad comparisons.

---

# 12. COMPENSATION RECORD

Create the primary compensation entity.

Suggested fields:

```text
id

companyId
roleId
levelId
locationId

currency

baseSalary
bonus
stock

totalCompensation

experienceYears

source
sourceUrl

reportedAt

createdAt
updatedAt
```

Additional metadata may be added where useful.

---

# 13. MONEY REPRESENTATION

Do NOT use JavaScript floating-point arithmetic for monetary calculations.

Use PostgreSQL `Decimal` / Prisma `Decimal`.

Example:

```text
baseSalary = 3500000
bonus = 500000
stock = 1000000
```

Total:

```text
5000000
```

Avoid:

```typescript
number
```

for persisted monetary values when precision can be lost.

Use Prisma Decimal appropriately.

---

# 14. TOTAL COMPENSATION

Total compensation must be calculated consistently.

Formula:

```text
totalCompensation =
    baseSalary
    + bonus
    + stock
```

Missing bonus:

```text
bonus = 0
```

Missing stock:

```text
stock = 0
```

Example:

```text
Base = 30,00,000
Bonus = null
Stock = 5,00,000

Total = 35,00,000
```

Never allow the frontend to determine the authoritative total.

The backend must calculate it.

Prefer recalculating the total when compensation records are created or updated.

---

# 15. CURRENCY

Every compensation record must contain a currency.

Examples:

```text
INR
USD
EUR
GBP
SGD
```

For the MVP:

* Do NOT implement live currency conversion unless necessary.
* Do NOT pretend currencies are directly comparable.
* Comparisons should clearly indicate the currency.

If currency conversion is not implemented, never show:

```text
$150,000 > ₹40,00,000
```

as though those values are directly comparable.

---

# 16. DATA INGESTION

The ingestion system is one of the most important parts of the backend.

Implement a REST endpoint for submitting compensation data.

Example:

```http
POST /api/v1/compensation
```

Request:

```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level": "L4",
  "country": "India",
  "region": "Karnataka",
  "city": "Bangalore",
  "currency": "INR",
  "baseSalary": 3500000,
  "bonus": 500000,
  "stock": 1000000,
  "experienceYears": 3,
  "source": "seed"
}
```

The ingestion process should:

1. Validate request
2. Normalize company
3. Normalize role
4. Normalize location
5. Resolve level
6. Validate monetary values
7. Default missing bonus to 0
8. Default missing stock to 0
9. Calculate total compensation
10. Detect duplicates
11. Persist transactionally
12. Return created record

---

# 17. BULK INGESTION

Implement a bulk ingestion endpoint.

Example:

```http
POST /api/v1/ingestion/compensation/bulk
```

Request:

```json
{
  "records": [
    {
      "company": "Google",
      "role": "Software Engineer",
      "level": "L4",
      "country": "India",
      "city": "Bangalore",
      "currency": "INR",
      "baseSalary": 3500000,
      "bonus": 500000,
      "stock": 1000000
    }
  ]
}
```

The system should return a summary:

```json
{
  "total": 100,
  "inserted": 82,
  "duplicates": 12,
  "rejected": 6,
  "errors": []
}
```

Do not make one enormous unvalidated database insertion.

Validate records individually.

Use transactions where appropriate.

---

# 18. VALIDATION RULES

The backend must reject invalid compensation records.

Minimum validation:

### Company

Required.

Cannot be empty.

### Role

Required.

Cannot be empty.

### Level

Required.

Cannot be empty.

### Currency

Required.

Must be a supported currency code.

### Base salary

Required.

Must be >= 0.

### Bonus

Optional.

If missing:

```text
0
```

Must be >= 0.

### Stock

Optional.

If missing:

```text
0
```

Must be >= 0.

### Experience

Optional.

If supplied:

```text
>= 0
```

### Total compensation

Must NOT be accepted as authoritative user input.

Calculate it server-side.

---

# 19. INVALID DATA EXAMPLES

These should be rejected:

```json
{
  "company": "",
  "baseSalary": 500000
}
```

```json
{
  "company": "Google",
  "baseSalary": -500000
}
```

```json
{
  "company": "Google",
  "baseSalary": 500000,
  "bonus": -100
}
```

```json
{
  "company": "Google",
  "baseSalary": "hello"
}
```

```json
{
  "company": "Google",
  "baseSalary": null,
  "currency": "INVALID"
}
```

Return structured validation errors.

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "baseSalary",
      "message": "Base salary must be greater than or equal to 0"
    }
  ]
}
```

---

# 20. DUPLICATE DETECTION

Duplicate handling is mandatory.

Create a deterministic duplicate strategy.

A compensation record should be considered a duplicate when the relevant identifying fields match.

Potential duplicate fingerprint:

```text
company
role
level
location
currency
baseSalary
bonus
stock
experienceYears
source
```

Normalize all relevant string fields before comparing.

Example:

```text
Google
google
GOOGLE
```

should not create three duplicate records.

Do not rely solely on application-level checks.

Use appropriate database constraints where practical.

---

# 21. SEARCH AND FILTERING

Implement a compensation search API.

Example:

```http
GET /api/v1/compensation
```

Supported query parameters:

```text
company
role
level
country
region
city
currency
minBaseSalary
maxBaseSalary
minTotalCompensation
maxTotalCompensation
minExperience
maxExperience
sort
order
page
limit
```

Example:

```http
GET /api/v1/compensation?company=Google&role=Software%20Engineer&city=Bangalore&page=1&limit=20
```

---

# 22. FILTERING REQUIREMENTS

Filtering must happen at the database query level.

Do NOT:

```text
fetch all records
→ filter in JavaScript
```

Instead:

```text
HTTP request
→ validated query
→ Prisma query
→ PostgreSQL filtering
→ paginated result
```

This is important for scalability.

---

# 23. PAGINATION

Implement pagination.

Use:

```text
page
limit
```

for the MVP.

Example:

```http
?page=2&limit=20
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 127,
    "totalPages": 7
  }
}
```

Set a reasonable maximum page size.

For example:

```text
limit <= 100
```

Never allow unrestricted result sizes.

---

# 24. SORTING

Support sorting by:

```text
baseSalary
bonus
stock
totalCompensation
experienceYears
reportedAt
```

Example:

```http
GET /api/v1/compensation?sort=totalCompensation&order=desc
```

Validate sort fields using an allowlist.

Never directly inject arbitrary query parameters into SQL.

---

# 25. COMPANY APIs

Implement:

```http
GET /api/v1/companies
GET /api/v1/companies/:slug
```

Company detail should provide:

* Company information
* Number of compensation records
* Compensation statistics
* Available roles
* Available levels
* Available locations

Example:

```json
{
  "company": {
    "name": "Google",
    "slug": "google"
  },
  "statistics": {
    "recordCount": 120,
    "averageBase": 3500000,
    "averageTotal": 4800000,
    "medianTotal": 4500000
  }
}
```

---

# 26. COMPANY AGGREGATION

Implement company-level aggregation.

At minimum calculate:

```text
record count
average base salary
median base salary
average total compensation
median total compensation
minimum total compensation
maximum total compensation
```

Where practical, calculate statistics in PostgreSQL rather than fetching the entire dataset.

For median, use PostgreSQL capabilities where possible.

If a database-level median is unnecessarily complex for the selected implementation, document the tradeoff.

---

# 27. ROLE + LEVEL AGGREGATION

Allow compensation statistics to be viewed for:

```text
Company
Company + Role
Company + Role + Level
Company + Role + Level + Location
```

Example:

```http
GET /api/v1/analytics/company/google?role=Software%20Engineer&level=L4&city=Bangalore
```

Return:

```text
sample size
average base
median base
average bonus
average stock
average total compensation
median total compensation
range
```

---

# 28. COMPENSATION COMPARISON

Implement a comparison endpoint.

Example:

```http
GET /api/v1/compare
```

Possible request:

```text
companyIds
role
level
location
currency
```

The endpoint should compare compensation statistics rather than simply dumping records.

Example response:

```json
{
  "criteria": {
    "role": "Software Engineer",
    "level": "L4",
    "city": "Bangalore",
    "currency": "INR"
  },
  "companies": [
    {
      "company": "Google",
      "sampleSize": 32,
      "averageBase": 3500000,
      "medianBase": 3400000,
      "averageTotal": 4800000,
      "medianTotal": 4600000
    }
  ]
}
```

---

# 29. IMPORTANT COMPARISON RULE

Never compare incompatible currencies as if they are equivalent.

If:

```text
Google = INR
Microsoft = USD
```

the API should either:

1. Require the same currency, or
2. Clearly separate results by currency.

Do NOT silently convert currencies using invented exchange rates.

---

# 30. ANALYTICS ENDPOINTS

Create an analytics module.

Suggested endpoints:

```text
GET /api/v1/analytics/companies/:slug
GET /api/v1/analytics/roles/:role
GET /api/v1/analytics/levels/:level
GET /api/v1/analytics/overview
```

The overview endpoint can return:

* Total companies
* Total compensation records
* Most represented roles
* Most represented levels
* Most represented locations
* Highest median compensation by company
* Compensation distribution summaries

Keep analytics useful but limited.

---

# 31. API VERSIONING

Use:

```text
/api/v1/...
```

from the beginning.

Example:

```text
/api/v1/companies
/api/v1/compensation
/api/v1/ingestion/compensation/bulk
/api/v1/compare
```

This demonstrates API evolution awareness.

---

# 32. RESPONSE FORMAT

Use consistent response structures.

Successful collection response:

```json
{
  "data": [],
  "pagination": {}
}
```

Successful single-resource response:

```json
{
  "data": {}
}
```

Errors:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": []
}
```

Do not return inconsistent structures between endpoints.

---

# 33. HTTP STATUS CODES

Use appropriate status codes.

Examples:

```text
200 OK
201 Created
400 Bad Request
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Examples:

Duplicate record:

```text
409 Conflict
```

Invalid request:

```text
400 Bad Request
```

Missing company:

```text
404 Not Found
```

Unexpected server failure:

```text
500 Internal Server Error
```

---

# 34. ERROR HANDLING

Implement centralized error handling.

Do not expose:

* Database connection strings
* Stack traces
* Internal SQL
* Secrets
* Sensitive infrastructure information

Development logs may contain useful debugging information, but API responses should remain safe.

---

# 35. DATABASE INDEXING

Create indexes for frequently queried fields.

At minimum consider:

```text
Company.normalizedName
Company.slug

Role.normalizedName
Role.slug

Compensation.companyId
Compensation.roleId
Compensation.levelId
Compensation.locationId
Compensation.currency

Compensation.totalCompensation
Compensation.baseSalary
```

Consider composite indexes for common filtering combinations.

Do not blindly index every column.

Document important indexing decisions.

---

# 36. DATABASE CONSTRAINTS

Use database constraints wherever possible.

Examples:

* Unique company slug
* Unique normalized company name
* Unique role slug
* Unique normalized role name
* Non-negative compensation values
* Foreign keys
* Required fields

Application validation should not be the only line of defense.

---

# 37. TRANSACTIONS

Use Prisma transactions where multiple related records need to be created or updated atomically.

Example ingestion:

```text
normalize company
→ create/find company
→ create/find role
→ create/find location
→ create/find level
→ create compensation record
```

This should not leave the database in a partially-created state if an operation fails.

---

# 38. SEED DATA

Create a realistic seed dataset.

Do NOT use only 5–10 records.

Target:

```text
20+ companies
10+ roles
10+ levels
10+ locations
200–500 compensation records
```

The exact number may be adjusted for development speed.

Data should cover:

### Companies

Examples:

```text
Google
Microsoft
Amazon
Meta
Apple
Adobe
Salesforce
Atlassian
Uber
Airbnb
Oracle
Nvidia
Netflix
Flipkart
Razorpay
PhonePe
Swiggy
Zomato
```

Do not imply that the values are authoritative real-world salary data.

Clearly mark the dataset as:

```text
Synthetic / Demo Data
```

---

# 39. SYNTHETIC DATA REQUIREMENT

Do not scrape websites.

Do not copy copyrighted salary datasets.

Do not present fabricated data as verified real-world compensation.

The seed dataset should be synthetic and clearly identified as such.

Use realistic ranges only for demonstrating functionality.

Example:

```text
Google
Software Engineer
L4
Bangalore
INR
Base: 3500000
Bonus: 500000
Stock: 1000000
```

This is demo data, not a factual salary claim.

---

# 40. SOURCE FIELD

Each compensation record should have a source field.

Examples:

```text
synthetic
import
user_submitted
```

For the MVP, seed data should use:

```text
synthetic
```

If a source URL is included, make it optional.

Do not pretend the synthetic data came from Levels.fyi.

---

# 41. FRONTEND REQUIREMENTS

Although the selected role is Backend Engineer, the final product needs a functional frontend to demonstrate the backend.

The frontend should be simple and professional.

Do NOT spend most of the project time on animations.

The backend is the priority.

---

# 42. FRONTEND PAGES

Implement these pages:

## Home / Dashboard

Display:

* Search
* Quick filters
* Number of companies
* Number of compensation records
* Popular roles
* Popular companies

---

## Compensation Explorer

Route:

```text
/compensation
```

Display a table containing:

```text
Company
Role
Level
Location
Base
Bonus
Stock
Total Compensation
Currency
```

Include:

* Search
* Filters
* Sorting
* Pagination

All data comes from APIs.

---

## Company Page

Route:

```text
/companies/[slug]
```

Display:

* Company name
* Sample size
* Compensation statistics
* Roles
* Levels
* Locations
* Compensation records

---

## Comparison Page

Route:

```text
/compare
```

Allow users to select companies and comparison criteria.

Display:

* Average base
* Median base
* Average total compensation
* Median total compensation
* Sample size

---

# 43. FRONTEND FILTERS

Implement filters for:

```text
Company
Role
Level
Country
City
Currency
Base salary range
Total compensation range
```

Filters should update API query parameters.

Do not filter a huge dataset entirely in the browser.

---

# 44. FRONTEND UX

The interface should clearly communicate:

* Loading states
* Empty states
* Error states
* Active filters
* Pagination
* Result count

Example empty state:

```text
No compensation records match your filters.
Try removing some filters.
```

Example error:

```text
We couldn't load compensation data.
Please try again.
```

---

# 45. DATA VISUALIZATION

Include a small number of useful visualizations.

Potential charts:

* Total compensation distribution
* Average compensation by company
* Compensation by level

Do not add charts merely for decoration.

Every visualization should answer a useful question.

---

# 46. API DOCUMENTATION

Generate API documentation.

Prefer Swagger/OpenAPI using NestJS Swagger.

Expose:

```text
/api/docs
```

Document:

* Endpoints
* Parameters
* Request bodies
* Response schemas
* Error responses

This is important for demonstrating backend quality.

---

# 47. HEALTH CHECK

Implement:

```http
GET /api/v1/health
```

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

If the database is unavailable, the health check should reflect that appropriately.

---

# 48. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

At minimum:

```text
DATABASE_URL=
PORT=
NODE_ENV=
```

Never commit:

```text
.env
```

Never hardcode credentials.

---

# 49. CONFIGURATION

Centralize configuration.

Do not scatter:

```typescript
process.env.DATABASE_URL
```

throughout the application.

Use a configuration module/service.

---

# 50. LOGGING

Implement structured server-side logging.

Log useful events such as:

```text
Application started
Database connected
Ingestion completed
Duplicate record detected
Validation failure
Unexpected error
```

Do not log sensitive information.

---

# 51. TESTING STRATEGY

Testing is important.

Implement:

## Unit tests

At minimum test:

### Company normalization

```text
Google
google
GOOGLE INC.
Google, Inc.
```

### Compensation calculation

```text
base + bonus + stock
```

### Missing bonus

```text
undefined → 0
```

### Missing stock

```text
undefined → 0
```

### Validation

Test:

* Negative salary
* Missing company
* Invalid currency
* Negative bonus
* Negative stock

### Duplicate detection

Verify equivalent records are rejected/detected.

---

# 52. INTEGRATION TESTS

Test important API flows.

At minimum:

```text
POST compensation
GET compensation
GET company
GET analytics
GET compare
POST bulk ingestion
```

Test both success and failure cases.

---

# 53. DATABASE TESTING

Make sure Prisma migrations work from a clean database.

The following workflow should work:

```text
install
→ configure DATABASE_URL
→ migrate
→ seed
→ run application
```

Do not require manually editing database tables.

---

# 54. SEED COMMAND

Provide a simple command such as:

```bash
npm run db:seed
```

or:

```bash
npx prisma db seed
```

Document it.

---

# 55. DEVELOPMENT COMMANDS

The README should document:

```bash
npm install
npm run dev
```

Backend:

```bash
npm run start:dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

Database:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

Use the actual commands appropriate for the final implementation.

---

# 56. MONOREPO / PROJECT STRUCTURE

A monorepo is preferred if it keeps the project organized.

Recommended:

```text
/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── shared/
│
├── prisma/
│
├── docs/
│
├── README.md
├── docker-compose.yml
├── package.json
└── .env.example
```

However, do not introduce Turborepo or another monorepo system merely for complexity.

If a simpler structure is better, use it.

The final architecture should be understandable by another developer.

---

# 57. DOCKER

Provide PostgreSQL development support using Docker Compose if practical.

Example:

```bash
docker compose up -d
```

This should start PostgreSQL locally.

Do not containerize the entire application unless it provides a real benefit.

---

# 58. SECURITY REQUIREMENTS

Implement basic production-minded security.

At minimum:

* Validate all input
* Restrict pagination size
* Allowlist sorting fields
* Avoid raw SQL where unnecessary
* Avoid SQL injection
* Avoid exposing stack traces
* Keep secrets in environment variables
* Use appropriate HTTP headers
* Configure CORS intentionally

Do not build a fake security system just to increase code volume.

---

# 59. RATE LIMITING

If practical, add basic rate limiting to ingestion endpoints.

The ingestion endpoint is more sensitive than read-only endpoints.

Example:

```text
POST /api/v1/compensation
POST /api/v1/ingestion/compensation/bulk
```

should have stricter limits.

If rate limiting is omitted from the MVP, document the reason.

---

# 60. CORS

Configure CORS explicitly.

Development:

```text
localhost
```

Production:

Use the deployed frontend origin.

Do not simply use:

```text
origin: "*"
```

without considering the application's deployment model.

---

# 61. API DESIGN PRINCIPLES

Follow REST principles where reasonable.

Use nouns for resources:

```text
/companies
/compensation
```

instead of:

```text
/getCompanies
/getSalaryData
```

Use HTTP methods correctly:

```text
GET
POST
PATCH
DELETE
```

Avoid unnecessary endpoint duplication.

---

# 62. BUSINESS LOGIC SEPARATION

Keep business logic in services.

Bad:

```text
Controller:
    normalize company
    calculate salary
    query database
    validate duplicate
    aggregate data
```

Better:

```text
Controller
    ↓
DTO validation
    ↓
Service
    ↓
Normalization
    ↓
Repository / Prisma
    ↓
Database
```

Controllers should primarily translate HTTP requests into application-service calls.

---

# 63. PRISMA GUIDELINES

Use Prisma for normal database access.

Avoid raw SQL unless necessary for:

* Complex aggregation
* Median calculations
* Performance-critical queries

If raw SQL is used:

* Parameterize it
* Document why it is necessary
* Keep it isolated

---

# 64. PERFORMANCE REQUIREMENTS

The application should remain responsive with several thousand compensation records.

Do not optimize prematurely.

However:

* Filtering should happen in PostgreSQL.
* Pagination should happen in PostgreSQL.
* Aggregation should happen in PostgreSQL where reasonable.
* Avoid N+1 queries.
* Avoid fetching unnecessary columns.
* Add appropriate indexes.

---

# 65. N+1 QUERY PREVENTION

Be careful with queries such as:

```text
Get 100 compensation records
→ query company for each record
→ query role for each record
→ query location for each record
```

Prefer Prisma relation loading or carefully designed queries.

---

# 66. CACHING

Caching is NOT mandatory.

Do not introduce Redis simply because it sounds impressive.

If caching is introduced, it must have a clear justification.

For the MVP, PostgreSQL query efficiency is more important than unnecessary infrastructure.

---

# 67. AUTHENTICATION

Authentication is NOT a core requirement for this backend-focused Track B implementation.

Do not spend substantial time building OAuth or social login.

If desired, an ingestion/admin endpoint can be protected using a simple mechanism, but this is secondary to the core requirements.

Prioritize:

```text
data quality
schema
APIs
validation
normalization
aggregation
comparison
```

---

# 68. ADMIN / INGESTION UI

A minimal internal ingestion page may be implemented if useful.

Route:

```text
/admin/ingestion
```

It can provide:

* Single record submission
* Bulk JSON submission
* Validation errors
* Ingestion summary

However, this is optional.

The ingestion API itself is mandatory.

---

# 69. RESEARCH REQUIREMENT

Before implementation, research the following products:

1. Levels.fyi
2. 6figr
3. AmbitionBox
4. Glassdoor

The research should identify:

* Core compensation features
* How salary data is presented
* How users filter compensation
* How companies are represented
* How levels are represented
* How comparisons work
* What useful features are common across products
* What should NOT be copied

Create:

```text
docs/research.md
```

containing:

### Key observations

and:

### Feature comparison

Use this structure:

```markdown
| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | Build? |
|---|---|---|---|---|---|
```

Do not blindly reproduce competitor features.

The research exists to inform product decisions.

---

# 70. DOCUMENTATION

Create:

```text
README.md
docs/
├── research.md
├── architecture.md
├── api.md
├── data-model.md
└── decisions.md
```

## README

Must contain:

* Project overview
* Tech stack
* Architecture summary
* Setup instructions
* Environment variables
* Database setup
* Seed instructions
* Development commands
* API documentation
* Testing
* Deployment
* Synthetic data disclaimer

---

# 71. ARCHITECTURE DOCUMENT

Create:

```text
docs/architecture.md
```

Explain:

* Application architecture
* Modules
* Request lifecycle
* Database architecture
* Ingestion pipeline
* Validation pipeline
* Normalization pipeline
* Aggregation architecture

Include an ASCII diagram if useful.

Example:

```text
Client
  |
  v
NestJS Controller
  |
  v
DTO Validation
  |
  v
Compensation Service
  |
  +----> Normalization Service
  |
  +----> Duplicate Detection
  |
  +----> Compensation Calculator
  |
  v
Prisma
  |
  v
PostgreSQL
```

---

# 72. DATA MODEL DOCUMENT

Create:

```text
docs/data-model.md
```

Document:

* Tables
* Relationships
* Important indexes
* Constraints
* Why the schema is normalized
* Duplicate strategy
* Monetary representation

---

# 73. ARCHITECTURAL DECISIONS

Create:

```text
docs/decisions.md
```

Document important decisions such as:

### Why PostgreSQL?

### Why Prisma?

### Why NestJS?

### Why separate Company / Role / Level entities?

### Why store base/bonus/stock separately?

### Why calculate total compensation server-side?

### Why use Decimal?

### How duplicates are identified

### How company names are normalized

### Why currency conversion is not implemented

### Why authentication is not core to the MVP

The goal is not to write an essay.

Each decision should contain:

```text
Decision
Reason
Tradeoff
```

---

# 74. UI DESIGN DIRECTION

The frontend should look like a credible developer-built data product.

Visual direction:

* Clean
* Modern
* Data-focused
* Professional
* Minimal
* Strong typography
* Good spacing
* Clear tables
* Subtle borders
* Restrained color usage

Avoid:

* Excessive gradients
* Huge hero sections
* Fake AI branding
* Excessive glassmorphism
* Excessive animations
* Decorative elements that don't improve usability

This is a compensation intelligence product, not a marketing landing page.

---

# 75. TABLE DESIGN

The compensation table is one of the most important UI components.

Columns:

```text
Company
Role
Level
Location
Base
Bonus
Stock
Total
Currency
```

Make it:

* Sortable
* Paginated
* Filterable
* Responsive

On mobile, allow horizontal scrolling rather than destroying the table structure.

---

# 76. LOADING STATES

Every asynchronous operation needs a loading state.

Do not leave the interface blank.

Use:

* Skeletons
* Loading indicators
* Disabled submit states

Avoid excessive animation.

---

# 77. ERROR STATES

Handle:

* API unavailable
* Database unavailable
* Invalid filters
* Empty results
* Failed ingestion
* Failed comparison

Errors should be understandable to users.

---

# 78. EMPTY DATA

When no records exist:

```text
No compensation data available.
```

When filters produce no results:

```text
No compensation records match your filters.
```

Do not show broken charts or empty tables with no explanation.

---

# 79. OBSERVABILITY

Include basic logging and health checks.

A production system would eventually benefit from:

* Metrics
* Distributed tracing
* Error monitoring
* Structured logs
* Alerting

These are NOT required for the MVP.

Mention them in future improvements instead of implementing unnecessary infrastructure.

---

# 80. FUTURE IMPROVEMENTS

Document potential future features:

* Authentication
* User-submitted salary reports
* Moderation
* Salary verification
* Currency conversion
* Historical compensation trends
* More advanced role normalization
* Company aliases
* Data confidence scoring
* Fraud detection
* Redis caching
* Background ingestion jobs
* Queue-based ingestion
* Advanced analytics
* Recommendation engine

Do NOT implement all of these.

---

# 81. IMPORTANT NON-GOALS

Do NOT build:

* A complete Levels.fyi clone
* A job board
* Recruitment system
* Resume builder
* Chatbot
* AI salary advisor
* Social network
* Complex authentication platform
* Payment system
* Scraping infrastructure
* Real-time salary scraping
* Cryptocurrency compensation system
* Unnecessary microservices

The goal is a strong backend MVP.

---

# 82. ANTI-PATTERNS TO AVOID

Do NOT:

### Hardcode salary data in React

Wrong:

```typescript
const salaries = [...]
```

for production UI data.

### Put database logic inside controllers

### Put business logic inside React components

### Use floating point for monetary calculations

### Accept client-provided total compensation

### Filter large datasets in the browser

### Fetch everything and paginate client-side

### Ignore duplicates

### Allow negative salaries

### Silently compare currencies

### Use random undocumented magic values

### Create unnecessary microservices

### Add libraries without justification

### Over-engineer authentication

### Build excessive animations

### Copy competitor data

---

# 83. IMPLEMENTATION ORDER

Build in this order.

## Phase 1 — Project Setup

1. Initialize repository
2. Configure TypeScript
3. Configure NestJS
4. Configure Next.js
5. Configure PostgreSQL
6. Configure Prisma
7. Configure environment variables
8. Configure linting
9. Configure formatting

---

## Phase 2 — Database

1. Design Prisma schema
2. Create migrations
3. Add relationships
4. Add constraints
5. Add indexes
6. Create seed script

---

## Phase 3 — Core Domain

Implement:

1. Company service
2. Role service
3. Level service
4. Location service
5. Compensation service
6. Normalization service
7. Compensation calculator

---

## Phase 4 — Validation

Implement:

1. DTO validation
2. Compensation validation
3. Currency validation
4. Salary validation
5. Experience validation
6. Error handling

---

## Phase 5 — Ingestion

Implement:

1. Single-record ingestion
2. Bulk ingestion
3. Duplicate detection
4. Transactions
5. Ingestion summary

---

## Phase 6 — Query APIs

Implement:

1. Compensation listing
2. Filtering
3. Pagination
4. Sorting
5. Company APIs
6. Role APIs

---

## Phase 7 — Analytics

Implement:

1. Company statistics
2. Role statistics
3. Level statistics
4. Compensation distributions
5. Comparison API

---

## Phase 8 — Frontend

Implement:

1. Dashboard
2. Compensation explorer
3. Company page
4. Comparison page
5. Filters
6. Pagination
7. Loading/error states

---

## Phase 9 — Testing

Implement:

1. Unit tests
2. Integration tests
3. API tests
4. Validation tests
5. Duplicate tests
6. Calculation tests

---

## Phase 10 — Documentation

Complete:

```text
README.md
docs/research.md
docs/architecture.md
docs/data-model.md
docs/decisions.md
```

---

## Phase 11 — Production Preparation

Verify:

* Build works
* Database migrations work
* Seed works
* Environment variables work
* No secrets committed
* API documentation works
* Health endpoint works
* Frontend can communicate with backend
* Production build works

---

# 84. DEFINITION OF DONE

The project is complete only when all of the following are true.

## Database

* [ ] PostgreSQL configured
* [ ] Prisma configured
* [ ] Migrations created
* [ ] Seed data created
* [ ] Foreign keys configured
* [ ] Important indexes configured
* [ ] Duplicate constraints implemented

## Backend

* [ ] NestJS application works
* [ ] API versioning implemented
* [ ] DTO validation implemented
* [ ] Company normalization implemented
* [ ] Role normalization implemented
* [ ] Compensation calculation implemented
* [ ] Duplicate detection implemented
* [ ] Single ingestion implemented
* [ ] Bulk ingestion implemented
* [ ] Filtering implemented
* [ ] Pagination implemented
* [ ] Sorting implemented
* [ ] Company aggregation implemented
* [ ] Comparison API implemented
* [ ] Error handling implemented
* [ ] Health endpoint implemented

## Frontend

* [ ] Dashboard works
* [ ] Compensation explorer works
* [ ] Filters work
* [ ] Sorting works
* [ ] Pagination works
* [ ] Company pages work
* [ ] Comparison page works
* [ ] Loading states exist
* [ ] Error states exist
* [ ] Empty states exist

## Testing

* [ ] Normalization tests
* [ ] Validation tests
* [ ] Calculation tests
* [ ] Duplicate tests
* [ ] API tests
* [ ] Integration tests

## Documentation

* [ ] README
* [ ] Research
* [ ] Architecture
* [ ] Data model
* [ ] Architecture decisions
* [ ] API documentation

## Deployment

* [ ] Production build works
* [ ] Database can be deployed
* [ ] Environment variables documented
* [ ] Frontend can access production API
* [ ] Health endpoint works

---

# 85. CLAUDE CODE EXECUTION INSTRUCTIONS

You are the implementation engineer for this project.

Do NOT immediately start generating large amounts of code.

First:

1. Inspect the repository.
2. Determine the existing project structure.
3. Identify whether anything already exists that can be reused.
4. Create an implementation plan.
5. Confirm the architecture is internally consistent.
6. Then implement incrementally.

Do not destroy existing functionality without understanding it first.

If the repository is empty, initialize the project according to this specification.

---

# 86. IMPLEMENTATION PRINCIPLES FOR CLAUDE CODE

When implementing:

### Prefer simple solutions

If two solutions work, choose the simpler one unless the more complex one provides a meaningful engineering benefit.

### Don't invent requirements

If something isn't required by this specification, don't build it just because it sounds impressive.

### Don't hide complexity

If a decision involves a tradeoff, document it.

### Don't over-engineer

Do not introduce:

* Redis
* Kafka
* RabbitMQ
* Kubernetes
* Microservices
* Elasticsearch

unless there is a concrete requirement that justifies them.

For this MVP, a well-designed:

```text
NestJS
+
PostgreSQL
+
Prisma
```

architecture is sufficient.

---

# 87. CODE QUALITY REQUIREMENTS

Code should be:

* Typed
* Modular
* Readable
* Testable
* Consistent
* Explicit

Avoid excessive abstraction.

Do not create interfaces/classes solely because "clean architecture" says so.

Abstractions should have a purpose.

Use meaningful names.

Bad:

```typescript
processData()
```

Better:

```typescript
ingestCompensationRecord()
```

Bad:

```typescript
data
```

Better:

```typescript
compensationRecord
```

---

# 88. TYPESCRIPT REQUIREMENTS

Use strict TypeScript configuration.

Avoid:

```typescript
any
```

unless absolutely necessary.

Prefer explicit types.

Validate external data at the boundary.

Remember:

> TypeScript types do not validate runtime input.

Runtime DTO validation is still required.

---

# 89. API CONTRACT REQUIREMENTS

The frontend should consume the backend through HTTP APIs.

Do not import backend services directly into the frontend.

The architecture should demonstrate an actual client/server boundary.

---

# 90. FINAL ENGINEERING REVIEW

Before declaring the project complete, perform a final review as if you were the hiring engineer.

Ask:

### Database

* Is the schema normalized?
* Are relationships correct?
* Are indexes justified?
* Are duplicate records prevented?

### API

* Are endpoints consistent?
* Are requests validated?
* Are errors structured?
* Is pagination safe?
* Is sorting secure?

### Business logic

* Is total compensation always correct?
* Are missing values handled?
* Is company normalization deterministic?
* Are duplicates handled?

### Reliability

* What happens when PostgreSQL fails?
* What happens when invalid data is submitted?
* What happens when the same record is submitted twice?
* What happens when filters return no results?

### Performance

* Does filtering happen in SQL?
* Does pagination happen in SQL?
* Are there N+1 queries?
* Are large result sets limited?

### Maintainability

* Can another engineer understand the modules?
* Are business rules documented?
* Are architectural decisions explained?

### Product

* Can someone actually explore compensation?
* Can they compare companies?
* Can they filter by level/location/role?
* Are the results understandable?

---

# 91. LOOM DEMO PREPARATION

The final project will be explained in a 5–10 minute Loom video.

The implementation should make it easy to demonstrate:

## 1. Product

Show:

```text
Dashboard
→ Compensation Explorer
→ Filters
→ Company
→ Comparison
```

## 2. Database

Show Prisma schema.

Explain:

* Company normalization
* Compensation relationships
* Decimal money fields
* Indexes
* Duplicate strategy

## 3. Backend

Show:

```text
Controller
→ DTO
→ Service
→ Normalization
→ Validation
→ Prisma
→ PostgreSQL
```

## 4. Data ingestion

Demonstrate:

```text
Valid record → accepted
Missing bonus → defaults to 0
Missing stock → defaults to 0
Invalid salary → rejected
Duplicate → detected
```

## 5. API

Show Swagger/OpenAPI.

## 6. Architecture

Explain the most important tradeoffs.

Do not spend the entire Loom describing UI.

The primary story should be:

> "I built a reliable compensation data system with normalized data, validated ingestion, duplicate handling, aggregation, filtering, and comparison APIs."

---

# 92. FINAL PRODUCT POSITIONING

The finished product should feel like:

> A structured compensation intelligence platform backed by a reliable relational data system.

Not:

> A pretty salary dashboard.

The strongest part of the project should be the backend.

The UI exists to expose and demonstrate the backend capabilities.

---

# 93. PRIORITY ORDER

If time becomes limited, prioritize in this exact order:

### P0 — Mandatory

1. PostgreSQL
2. Prisma schema
3. Compensation model
4. Company normalization
5. Validation
6. Total compensation calculation
7. Duplicate handling
8. Ingestion API
9. Filtering
10. Pagination
11. Aggregation
12. Comparison API

### P1 — Important

13. Swagger
14. Seed data
15. Unit tests
16. Integration tests
17. Company pages
18. Compensation explorer
19. Documentation

### P2 — Nice to have

20. Charts
21. Admin ingestion UI
22. Health dashboard
23. Advanced analytics
24. Rate limiting

Do not sacrifice P0 engineering quality to build P2 features.

---

# 94. SUCCESS CRITERIA

The project succeeds if a backend engineer reviewing the repository can confidently answer:

> "Yes, this developer understands relational data modeling."

> "Yes, they understand API design."

> "Yes, they understand validation."

> "Yes, they understand data normalization."

> "Yes, they thought about duplicates and data integrity."

> "Yes, they know how aggregation and filtering should be implemented."

> "Yes, the code is structured well enough for another engineer to work on."

> "Yes, they can explain their technical decisions."

That is the primary goal of the project.

---

# 95. FINAL INSTRUCTION

Build the system described above.

Prioritize engineering correctness over feature count.

Prioritize backend quality over frontend polish.

Do not fabricate external data sources.

Use synthetic/demo compensation data and label it accordingly.

Do not copy competitor implementations or datasets.

Do not use prompt-to-app/no-code generators.

AI-assisted coding is permitted, but every implementation decision must be understandable and explainable by the developer.

When you encounter ambiguity:

1. Prefer the simplest reasonable solution.
2. Preserve the core backend requirements.
3. Document the decision.
4. Continue implementation rather than stopping unnecessarily.

Before finishing, run:

* TypeScript checks
* Lint
* Tests
* Prisma validation
* Production build

Fix all significant errors.

Then provide a concise final implementation summary containing:

```text
1. What was built
2. Architecture
3. Database schema
4. API endpoints
5. Validation/normalization strategy
6. Duplicate strategy
7. Tests
8. How to run locally
9. Known limitations
10. Recommended next steps
```
