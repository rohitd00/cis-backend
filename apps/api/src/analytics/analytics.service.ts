import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationService } from '../normalization/normalization.service';
import { CompareQueryDto } from './dto/compare-query.dto';
import { computeCompensationStats } from './compensation-stats.util';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalization: NormalizationService,
  ) {}

  async overview() {
    const [totalCompanies, totalRecords, topRoles, topLocations] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.compensation.count(),
      this.prisma.compensation.groupBy({
        by: ['roleId'],
        _count: { roleId: true },
        orderBy: { _count: { roleId: 'desc' } },
        take: 5,
      }),
      this.prisma.compensation.groupBy({
        by: ['locationId'],
        _count: { locationId: true },
        orderBy: { _count: { locationId: 'desc' } },
        take: 5,
      }),
    ]);

    const roleIds = topRoles.map((r) => r.roleId);
    const roles = await this.prisma.role.findMany({ where: { id: { in: roleIds } } });
    const roleNameById = new Map(roles.map((r) => [r.id, r.name]));

    const locationIds = topLocations.map((l) => l.locationId);
    const locations = await this.prisma.location.findMany({ where: { id: { in: locationIds } } });
    const locationById = new Map(locations.map((l) => [l.id, l]));

    return {
      totalCompanies,
      totalCompensationRecords: totalRecords,
      popularRoles: topRoles.map((r) => ({
        role: roleNameById.get(r.roleId) ?? 'Unknown',
        count: r._count.roleId,
      })),
      popularLocations: topLocations.map((l) => {
        const location = locationById.get(l.locationId);
        return {
          city: location?.city ?? null,
          country: location?.country ?? null,
          count: l._count.locationId,
        };
      }),
      dataDisclaimer: 'All compensation data is synthetic/demo data, not real-world salary records.',
    };
  }

  async compare(query: CompareQueryDto) {
    const slugs = query.companySlugs
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean);

    const companies = await this.prisma.company.findMany({ where: { slug: { in: slugs } } });

    const roleFilter = query.role
      ? await this.prisma.role.findUnique({
          where: { normalizedName: this.normalization.normalizeRoleName(query.role) },
        })
      : null;

    const locationFilter = query.city
      ? await this.prisma.location.findFirst({
          where: { normalizedCity: this.normalization.normalizeLocationPart(query.city) },
        })
      : null;

    const companyResults = await Promise.all(
      companies.map(async (company) => {
        const levelFilter = query.level
          ? await this.prisma.level.findFirst({
              where: {
                companyId: company.id,
                normalizedName: this.normalization.normalizeLevelName(query.level),
              },
            })
          : null;

        const stats = await computeCompensationStats(this.prisma, {
          companyId: company.id,
          roleId: roleFilter?.id,
          levelId: levelFilter?.id,
          locationId: locationFilter?.id,
          currency: query.currency,
        });

        return {
          company: company.name,
          slug: company.slug,
          ...stats,
        };
      }),
    );

    const foundSlugs = new Set(companies.map((c) => c.slug));
    const missingSlugs = slugs.filter((slug) => !foundSlugs.has(slug));

    return {
      criteria: {
        role: query.role ?? null,
        level: query.level ?? null,
        city: query.city ?? null,
        currency: query.currency,
      },
      companies: companyResults,
      ...(missingSlugs.length > 0 && { unknownCompanySlugs: missingSlugs }),
    };
  }
}
