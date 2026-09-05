import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationService } from '../normalization/normalization.service';
import { CompensationCalculatorService } from './compensation-calculator.service';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { CreateCompensationDto } from './dto/create-compensation.dto';
import { QueryCompensationDto } from './dto/query-compensation.dto';
import { buildPaginationMeta, DEFAULT_PAGE_SIZE } from '../common/dto/pagination.dto';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const COMPENSATION_INCLUDE = {
  company: true,
  role: true,
  level: true,
  location: true,
} satisfies Prisma.CompensationInclude;

type CompensationWithRelations = Prisma.CompensationGetPayload<{
  include: typeof COMPENSATION_INCLUDE;
}>;

@Injectable()
export class CompensationService {
  private readonly logger = new Logger(CompensationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly normalization: NormalizationService,
    private readonly calculator: CompensationCalculatorService,
    private readonly duplicateDetection: DuplicateDetectionService,
  ) {}

  /**
   * Full ingestion pipeline for one record:
   * normalize -> resolve company/role/level/location -> default bonus/stock
   * -> calculate total -> fingerprint -> transactional insert.
   *
   * Runs inside a single Prisma transaction so a failure partway through
   * (e.g. the compensation insert violating the fingerprint uniqueness
   * constraint) never leaves an orphaned Company/Role/Level/Location behind
   * without a compensation record — though in practice those upserts are
   * idempotent and safe to keep even on rollback of the final insert.
   */
  async create(dto: CreateCompensationDto): Promise<CompensationWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      return this.createWithinTransaction(tx, dto);
    });
  }

  /**
   * Same pipeline as `create`, but designed to be called many times inside
   * one caller-managed transaction (used by bulk ingestion) and to surface
   * duplicate/validation failures as typed errors rather than throwing
   * HttpExceptions that would abort the whole batch transaction.
   */
  async createWithinTransaction(
    tx: TransactionClient,
    dto: CreateCompensationDto,
  ): Promise<CompensationWithRelations> {
    const normalizedCompanyName = this.normalization.normalizeCompanyName(dto.company);
    const normalizedRoleName = this.normalization.normalizeRoleName(dto.role);
    const normalizedLevelName = this.normalization.normalizeLevelName(dto.level);
    const normalizedCountry = this.normalization.normalizeLocationPart(dto.country);
    const normalizedRegion = this.normalization.normalizeLocationPart(dto.region);
    const normalizedCity = this.normalization.normalizeLocationPart(dto.city);

    const company = await tx.company.upsert({
      where: { normalizedName: normalizedCompanyName },
      update: {},
      create: {
        name: dto.company.trim(),
        normalizedName: normalizedCompanyName,
        slug: this.normalization.slugify(normalizedCompanyName),
      },
    });

    const role = await tx.role.upsert({
      where: { normalizedName: normalizedRoleName },
      update: {},
      create: {
        name: dto.role.trim(),
        normalizedName: normalizedRoleName,
        slug: this.normalization.slugify(normalizedRoleName),
      },
    });

    const location = await tx.location.upsert({
      where: {
        normalizedCountry_normalizedRegion_normalizedCity: {
          normalizedCountry,
          normalizedRegion,
          normalizedCity,
        },
      },
      update: {},
      create: {
        country: dto.country.trim(),
        region: dto.region?.trim() || null,
        city: dto.city?.trim() || null,
        normalizedCountry,
        normalizedRegion,
        normalizedCity,
      },
    });

    const level = await tx.level.upsert({
      where: {
        companyId_normalizedName: {
          companyId: company.id,
          normalizedName: normalizedLevelName,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        name: dto.level.trim(),
        normalizedName: normalizedLevelName,
      },
    });

    const bonus = dto.bonus ?? 0;
    const stock = dto.stock ?? 0;
    const total = this.calculator.calculateTotal(dto.baseSalary, bonus, stock);
    const source = dto.source?.trim() || 'synthetic';

    const fingerprint = this.duplicateDetection.buildFingerprint({
      normalizedCompanyName,
      normalizedRoleName,
      normalizedLevelName,
      normalizedCountry,
      normalizedRegion,
      normalizedCity,
      currency: dto.currency,
      baseSalary: new Prisma.Decimal(dto.baseSalary).toString(),
      bonus: new Prisma.Decimal(bonus).toString(),
      stock: new Prisma.Decimal(stock).toString(),
      experienceYears: dto.experienceYears ?? null,
      source,
    });

    const existing = await tx.compensation.findUnique({ where: { fingerprint } });
    if (existing) {
      this.logger.warn(
        `Duplicate record detected for ${normalizedCompanyName}/${normalizedRoleName}/${normalizedLevelName}`,
      );
      throw new ConflictException('Duplicate compensation record');
    }

    return tx.compensation.create({
      data: {
        companyId: company.id,
        roleId: role.id,
        levelId: level.id,
        locationId: location.id,
        currency: dto.currency,
        baseSalary: dto.baseSalary,
        bonus,
        stock,
        totalCompensation: total,
        experienceYears: dto.experienceYears ?? null,
        source,
        sourceUrl: dto.sourceUrl ?? null,
        fingerprint,
      },
      include: COMPENSATION_INCLUDE,
    });
  }

  async findMany(query: QueryCompensationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;

    const locationWhere: Prisma.LocationWhereInput = {
      ...(query.country && {
        normalizedCountry: this.normalization.normalizeLocationPart(query.country),
      }),
      ...(query.region && {
        normalizedRegion: this.normalization.normalizeLocationPart(query.region),
      }),
      ...(query.city && {
        normalizedCity: this.normalization.normalizeLocationPart(query.city),
      }),
    };

    const where: Prisma.CompensationWhereInput = {
      ...(query.company && {
        company: { normalizedName: this.normalization.normalizeCompanyName(query.company) },
      }),
      ...(query.role && {
        role: { normalizedName: this.normalization.normalizeRoleName(query.role) },
      }),
      ...(query.level && {
        level: { normalizedName: this.normalization.normalizeLevelName(query.level) },
      }),
      ...(Object.keys(locationWhere).length > 0 && { location: locationWhere }),
      ...(query.currency && { currency: query.currency }),
      ...((query.minBaseSalary !== undefined || query.maxBaseSalary !== undefined) && {
        baseSalary: {
          ...(query.minBaseSalary !== undefined && { gte: query.minBaseSalary }),
          ...(query.maxBaseSalary !== undefined && { lte: query.maxBaseSalary }),
        },
      }),
      ...((query.minTotalCompensation !== undefined ||
        query.maxTotalCompensation !== undefined) && {
        totalCompensation: {
          ...(query.minTotalCompensation !== undefined && { gte: query.minTotalCompensation }),
          ...(query.maxTotalCompensation !== undefined && { lte: query.maxTotalCompensation }),
        },
      }),
      ...((query.minExperience !== undefined || query.maxExperience !== undefined) && {
        experienceYears: {
          ...(query.minExperience !== undefined && { gte: query.minExperience }),
          ...(query.maxExperience !== undefined && { lte: query.maxExperience }),
        },
      }),
    };

    const sortField = query.sort ?? 'reportedAt';
    const order = query.order ?? 'desc';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.compensation.findMany({
        where,
        include: COMPENSATION_INCLUDE,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.compensation.count({ where }),
    ]);

    return { data, pagination: buildPaginationMeta(page, limit, total) };
  }
}
