/**
 * Allowlist of fields sortable via ?sort=. Never pass a client-provided
 * string directly into a Prisma `orderBy` key — validate against this set
 * first (see QueryCompensationDto / CompensationService.findMany).
 */
export const COMPENSATION_SORT_FIELDS = [
  'baseSalary',
  'bonus',
  'stock',
  'totalCompensation',
  'experienceYears',
  'reportedAt',
] as const;

export type CompensationSortField = (typeof COMPENSATION_SORT_FIELDS)[number];
