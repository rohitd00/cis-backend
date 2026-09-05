import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CompensationStatsFilter {
  companyId?: string;
  roleId?: string;
  levelId?: string;
  locationId?: string;
  currency?: string;
}

export interface CompensationStats {
  sampleSize: number;
  averageBase: number;
  medianBase: number;
  averageBonus: number;
  averageStock: number;
  averageTotal: number;
  medianTotal: number;
  minTotal: number;
  maxTotal: number;
}

interface RawStatsRow {
  sample_size: bigint | number;
  avg_base: number | null;
  median_base: number | null;
  avg_bonus: number | null;
  avg_stock: number | null;
  avg_total: number | null;
  median_total: number | null;
  min_total: number | null;
  max_total: number | null;
}

/**
 * Computes compensation aggregate statistics in PostgreSQL rather than
 * pulling every matching row into Node.js. Uses raw SQL only for
 * `percentile_cont` (median), which Prisma's query builder cannot express —
 * every value here is passed as a bound parameter, never string-interpolated.
 */
export async function computeCompensationStats(
  prisma: PrismaService,
  filter: CompensationStatsFilter,
): Promise<CompensationStats> {
  const conditions: Prisma.Sql[] = [];

  if (filter.companyId) conditions.push(Prisma.sql`"companyId" = ${filter.companyId}`);
  if (filter.roleId) conditions.push(Prisma.sql`"roleId" = ${filter.roleId}`);
  if (filter.levelId) conditions.push(Prisma.sql`"levelId" = ${filter.levelId}`);
  if (filter.locationId) conditions.push(Prisma.sql`"locationId" = ${filter.locationId}`);
  if (filter.currency) conditions.push(Prisma.sql`currency = ${filter.currency}`);

  const whereClause =
    conditions.length > 0 ? Prisma.join(conditions, ' AND ') : Prisma.sql`TRUE`;

  const rows = await prisma.$queryRaw<RawStatsRow[]>(Prisma.sql`
    SELECT
      count(*)::int AS sample_size,
      avg("baseSalary")::float AS avg_base,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY "baseSalary")::float AS median_base,
      avg(bonus)::float AS avg_bonus,
      avg(stock)::float AS avg_stock,
      avg("totalCompensation")::float AS avg_total,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY "totalCompensation")::float AS median_total,
      min("totalCompensation")::float AS min_total,
      max("totalCompensation")::float AS max_total
    FROM compensations
    WHERE ${whereClause}
  `);

  const row = rows[0];
  const sampleSize = Number(row?.sample_size ?? 0);

  return {
    sampleSize,
    averageBase: row?.avg_base ?? 0,
    medianBase: row?.median_base ?? 0,
    averageBonus: row?.avg_bonus ?? 0,
    averageStock: row?.avg_stock ?? 0,
    averageTotal: row?.avg_total ?? 0,
    medianTotal: row?.median_total ?? 0,
    minTotal: row?.min_total ?? 0,
    maxTotal: row?.max_total ?? 0,
  };
}
