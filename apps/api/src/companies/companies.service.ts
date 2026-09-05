import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationService } from '../normalization/normalization.service';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { CompanyDetailQueryDto } from './dto/company-detail-query.dto';
import { buildPaginationMeta, DEFAULT_PAGE_SIZE } from '../common/dto/pagination.dto';
import { computeCompensationStats } from '../analytics/compensation-stats.util';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalization: NormalizationService,
  ) {}

  async findMany(query: QueryCompaniesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;

    const where: Prisma.CompanyWhereInput = query.search
      ? { normalizedName: { contains: this.normalization.normalizeCompanyName(query.search) } }
      : {};

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        include: { _count: { select: { compensations: true } } },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    const data = companies.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      website: company.website,
      recordCount: company._count.compensations,
    }));

    return { data, pagination: buildPaginationMeta(page, limit, total) };
  }

  async findBySlug(slug: string, query: CompanyDetailQueryDto) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) {
      throw new NotFoundException(`Company "${slug}" not found`);
    }

    const roleFilter = query.role
      ? await this.prisma.role.findUnique({
          where: { normalizedName: this.normalization.normalizeRoleName(query.role) },
        })
      : null;

    const levelFilter = query.level
      ? await this.prisma.level.findFirst({
          where: {
            companyId: company.id,
            normalizedName: this.normalization.normalizeLevelName(query.level),
          },
        })
      : null;

    const locationFilter = query.city
      ? await this.prisma.location.findFirst({
          where: { normalizedCity: this.normalization.normalizeLocationPart(query.city) },
        })
      : null;

    const scopeWhere: Prisma.CompensationWhereInput = {
      companyId: company.id,
      ...(roleFilter && { roleId: roleFilter.id }),
      ...(levelFilter && { levelId: levelFilter.id }),
      ...(locationFilter && { locationId: locationFilter.id }),
    };

    // Statistics are never blended across currencies (a company with both a
    // US and an India office must not average USD and INR base salaries
    // together). If the caller doesn't pin a currency, we break statistics
    // out per currency actually present in scope instead of guessing one.
    const currencies = query.currency
      ? [query.currency]
      : (
          await this.prisma.compensation.findMany({
            where: scopeWhere,
            distinct: ['currency'],
            select: { currency: true },
          })
        ).map((row) => row.currency);

    const statisticsByCurrency = await Promise.all(
      currencies.map(async (currency) => ({
        currency,
        ...(await computeCompensationStats(this.prisma, {
          companyId: company.id,
          roleId: roleFilter?.id,
          levelId: levelFilter?.id,
          locationId: locationFilter?.id,
          currency,
        })),
      })),
    );

    const [roles, levels, locations] = await Promise.all([
      this.prisma.role.findMany({
        where: { compensations: { some: { companyId: company.id } } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.level.findMany({
        where: { companyId: company.id },
        select: { id: true, name: true, seniorityRank: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.location.findMany({
        where: { compensations: { some: { companyId: company.id } } },
        select: { id: true, country: true, region: true, city: true },
        orderBy: { country: 'asc' },
      }),
    ]);

    return {
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        website: company.website,
      },
      recordCount: statisticsByCurrency.reduce((sum, s) => sum + s.sampleSize, 0),
      statisticsByCurrency,
      roles,
      levels,
      locations,
    };
  }
}
