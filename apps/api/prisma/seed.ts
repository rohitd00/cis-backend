/**
 * Synthetic/demo data seed script.
 *
 * IMPORTANT: every value generated here is synthetic. It does not represent
 * real compensation observed at any of these companies. Company names are
 * used only as realistic labels to demonstrate filtering/aggregation.
 *
 * Reuses the actual application services (NormalizationService,
 * CompensationCalculatorService, DuplicateDetectionService) rather than
 * re-implementing normalization/calculation rules, so seed data is always
 * consistent with what the API itself would produce.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { NormalizationService } from '../src/normalization/normalization.service';
import { CompensationCalculatorService } from '../src/compensation/compensation-calculator.service';
import { DuplicateDetectionService } from '../src/compensation/duplicate-detection.service';

const prisma = new PrismaClient();
const normalization = new NormalizationService();
const calculator = new CompensationCalculatorService();
const duplicateDetection = new DuplicateDetectionService();

// ---- Deterministic PRNG (mulberry32) so re-seeding is reproducible ----
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20240905);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(min + rng() * (max - min + 1));
const chance = (p: number) => rng() < p;

interface LocationSeed {
  country: string;
  region?: string;
  city: string;
  currency: string;
}

const LOCATIONS: LocationSeed[] = [
  { country: 'India', region: 'Karnataka', city: 'Bangalore', currency: 'INR' },
  { country: 'India', region: 'Telangana', city: 'Hyderabad', currency: 'INR' },
  { country: 'India', region: 'Maharashtra', city: 'Pune', currency: 'INR' },
  { country: 'India', region: 'Haryana', city: 'Gurgaon', currency: 'INR' },
  { country: 'India', region: 'Maharashtra', city: 'Mumbai', currency: 'INR' },
  { country: 'India', region: 'Tamil Nadu', city: 'Chennai', currency: 'INR' },
  { country: 'United States', region: 'Washington', city: 'Seattle', currency: 'USD' },
  { country: 'United States', region: 'California', city: 'San Francisco', currency: 'USD' },
  { country: 'United States', region: 'Washington', city: 'Redmond', currency: 'USD' },
  { country: 'United States', region: 'New York', city: 'New York', currency: 'USD' },
  { country: 'United States', region: 'Texas', city: 'Austin', currency: 'USD' },
  { country: 'United Kingdom', city: 'London', currency: 'GBP' },
  { country: 'Singapore', city: 'Singapore', currency: 'SGD' },
  { country: 'Ireland', city: 'Dublin', currency: 'EUR' },
];

const ROLES = [
  'Software Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Full Stack Engineer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Data Engineer',
  'Engineering Manager',
  'QA Engineer',
  'Site Reliability Engineer',
];

/** seniorityRank: 1 (most junior) .. 6 (most senior) */
type LevelLadderEntry = { name: string; rank: number };

const STANDARD_LADDER: LevelLadderEntry[] = [
  { name: 'L1', rank: 1 },
  { name: 'L2', rank: 2 },
  { name: 'L3', rank: 3 },
  { name: 'L4', rank: 4 },
  { name: 'L5', rank: 5 },
  { name: 'L6', rank: 6 },
];

const COMPANIES: { name: string; ladder: LevelLadderEntry[] }[] = [
  { name: 'Google', ladder: STANDARD_LADDER },
  { name: 'Meta', ladder: STANDARD_LADDER },
  { name: 'Adobe', ladder: STANDARD_LADDER },
  { name: 'Salesforce', ladder: STANDARD_LADDER },
  { name: 'Atlassian', ladder: STANDARD_LADDER },
  { name: 'Uber', ladder: STANDARD_LADDER },
  { name: 'Airbnb', ladder: STANDARD_LADDER },
  { name: 'Oracle', ladder: STANDARD_LADDER },
  { name: 'Nvidia', ladder: STANDARD_LADDER },
  { name: 'Flipkart', ladder: STANDARD_LADDER },
  { name: 'Razorpay', ladder: STANDARD_LADDER },
  { name: 'PhonePe', ladder: STANDARD_LADDER },
  { name: 'Swiggy', ladder: STANDARD_LADDER },
  { name: 'Zomato', ladder: STANDARD_LADDER },
  { name: 'Infosys', ladder: STANDARD_LADDER },
  {
    name: 'Microsoft',
    ladder: [
      { name: '59', rank: 1 },
      { name: '62', rank: 2 },
      { name: '63', rank: 3 },
      { name: '64', rank: 4 },
      { name: '65', rank: 5 },
      { name: '67', rank: 6 },
    ],
  },
  {
    name: 'Amazon',
    ladder: [
      { name: 'SDE I', rank: 1 },
      { name: 'SDE II', rank: 3 },
      { name: 'SDE III', rank: 5 },
      { name: 'Principal SDE', rank: 6 },
    ],
  },
  {
    name: 'Apple',
    ladder: [
      { name: 'ICT2', rank: 1 },
      { name: 'ICT3', rank: 2 },
      { name: 'ICT4', rank: 3 },
      { name: 'ICT5', rank: 5 },
      { name: 'ICT6', rank: 6 },
    ],
  },
  {
    name: 'Netflix',
    ladder: [
      { name: 'Senior', rank: 4 },
      { name: 'Staff', rank: 5 },
      { name: 'Principal', rank: 6 },
    ],
  },
  {
    name: 'Tata Consultancy Services',
    ladder: [
      { name: 'Assistant System Engineer', rank: 1 },
      { name: 'System Engineer', rank: 2 },
      { name: 'IT Analyst', rank: 3 },
      { name: 'IT Consultant', rank: 4 },
    ],
  },
];

/**
 * Base salary ranges (annual, in the location's local currency) by
 * seniority rank. These are illustrative synthetic bands only.
 */
const BASE_RANGE_BY_RANK_AND_CURRENCY: Record<string, [number, number]> = {
  'INR-1': [600000, 1000000],
  'INR-2': [1000000, 1600000],
  'INR-3': [1600000, 2600000],
  'INR-4': [2600000, 4000000],
  'INR-5': [4000000, 6000000],
  'INR-6': [6000000, 9000000],
  'USD-1': [95000, 120000],
  'USD-2': [120000, 150000],
  'USD-3': [150000, 190000],
  'USD-4': [190000, 240000],
  'USD-5': [240000, 320000],
  'USD-6': [320000, 420000],
  'GBP-1': [45000, 60000],
  'GBP-2': [60000, 78000],
  'GBP-3': [78000, 100000],
  'GBP-4': [100000, 130000],
  'GBP-5': [130000, 170000],
  'GBP-6': [170000, 220000],
  'SGD-1': [70000, 90000],
  'SGD-2': [90000, 115000],
  'SGD-3': [115000, 150000],
  'SGD-4': [150000, 190000],
  'SGD-5': [190000, 250000],
  'SGD-6': [250000, 320000],
  'EUR-1': [50000, 65000],
  'EUR-2': [65000, 85000],
  'EUR-3': [85000, 110000],
  'EUR-4': [110000, 140000],
  'EUR-5': [140000, 180000],
  'EUR-6': [180000, 230000],
};

async function ingest(input: {
  company: string;
  role: string;
  level: string;
  location: LocationSeed;
  baseSalary: number;
  bonus: number;
  stock: number;
  experienceYears: number;
}): Promise<'inserted' | 'duplicate'> {
  const normalizedCompanyName = normalization.normalizeCompanyName(input.company);
  const normalizedRoleName = normalization.normalizeRoleName(input.role);
  const normalizedLevelName = normalization.normalizeLevelName(input.level);
  const normalizedCountry = normalization.normalizeLocationPart(input.location.country);
  const normalizedRegion = normalization.normalizeLocationPart(input.location.region);
  const normalizedCity = normalization.normalizeLocationPart(input.location.city);

  const company = await prisma.company.upsert({
    where: { normalizedName: normalizedCompanyName },
    update: {},
    create: {
      name: input.company,
      normalizedName: normalizedCompanyName,
      slug: normalization.slugify(normalizedCompanyName),
    },
  });

  const role = await prisma.role.upsert({
    where: { normalizedName: normalizedRoleName },
    update: {},
    create: {
      name: input.role,
      normalizedName: normalizedRoleName,
      slug: normalization.slugify(normalizedRoleName),
    },
  });

  const location = await prisma.location.upsert({
    where: {
      normalizedCountry_normalizedRegion_normalizedCity: {
        normalizedCountry,
        normalizedRegion,
        normalizedCity,
      },
    },
    update: {},
    create: {
      country: input.location.country,
      region: input.location.region ?? null,
      city: input.location.city,
      normalizedCountry,
      normalizedRegion,
      normalizedCity,
    },
  });

  const level = await prisma.level.upsert({
    where: { companyId_normalizedName: { companyId: company.id, normalizedName: normalizedLevelName } },
    update: {},
    create: { companyId: company.id, name: input.level, normalizedName: normalizedLevelName },
  });

  const total = calculator.calculateTotal(input.baseSalary, input.bonus, input.stock);
  const source = 'synthetic';

  const fingerprint = duplicateDetection.buildFingerprint({
    normalizedCompanyName,
    normalizedRoleName,
    normalizedLevelName,
    normalizedCountry,
    normalizedRegion,
    normalizedCity,
    currency: input.location.currency,
    baseSalary: new Prisma.Decimal(input.baseSalary).toString(),
    bonus: new Prisma.Decimal(input.bonus).toString(),
    stock: new Prisma.Decimal(input.stock).toString(),
    experienceYears: input.experienceYears,
    source,
  });

  const existing = await prisma.compensation.findUnique({ where: { fingerprint } });
  if (existing) return 'duplicate';

  await prisma.compensation.create({
    data: {
      companyId: company.id,
      roleId: role.id,
      levelId: level.id,
      locationId: location.id,
      currency: input.location.currency,
      baseSalary: input.baseSalary,
      bonus: input.bonus,
      stock: input.stock,
      totalCompensation: total,
      experienceYears: input.experienceYears,
      source,
      fingerprint,
    },
  });

  return 'inserted';
}

async function main() {
  console.log('Seeding synthetic compensation data...');

  const TARGET_RECORDS = 350;
  let inserted = 0;
  let duplicates = 0;

  for (let i = 0; i < TARGET_RECORDS; i++) {
    const companySeed = pick(COMPANIES);
    const role = pick(ROLES);
    const levelEntry = pick(companySeed.ladder);
    const location = pick(LOCATIONS);

    const rangeKey = `${location.currency}-${levelEntry.rank}`;
    const [min, max] = BASE_RANGE_BY_RANK_AND_CURRENCY[rangeKey] ?? [50000, 100000];
    const baseSalary = randInt(min, max);

    // Bonus/stock scale with seniority; ~15% of records omit them entirely
    // to exercise the default-to-0 path.
    const hasBonus = !chance(0.15);
    const hasStock = !chance(0.15);
    const bonus = hasBonus ? Math.round(baseSalary * (0.05 + rng() * 0.15)) : 0;
    const stock = hasStock ? Math.round(baseSalary * (levelEntry.rank * 0.05 + rng() * 0.2)) : 0;

    const experienceYears = Math.max(0, Math.round((levelEntry.rank * 1.5 + rng() * 2) * 10) / 10);

    const outcome = await ingest({
      company: companySeed.name,
      role,
      level: levelEntry.name,
      location,
      baseSalary,
      bonus,
      stock,
      experienceYears,
    });

    if (outcome === 'inserted') inserted++;
    else duplicates++;
  }

  const [companyCount, roleCount, levelCount, locationCount, compCount] = await Promise.all([
    prisma.company.count(),
    prisma.role.count(),
    prisma.level.count(),
    prisma.location.count(),
    prisma.compensation.count(),
  ]);

  console.log(`Done. Attempted ${TARGET_RECORDS} records: ${inserted} inserted, ${duplicates} duplicates skipped.`);
  console.log(
    `Database now has ${companyCount} companies, ${roleCount} roles, ${levelCount} levels, ${locationCount} locations, ${compCount} compensation records.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
