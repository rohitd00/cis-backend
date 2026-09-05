import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { CompanyDetailQueryDto } from './dto/company-detail-query.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List companies with record counts' })
  async findMany(@Query() query: QueryCompaniesDto) {
    return this.companiesService.findMany(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Company detail: statistics, roles, levels, locations' })
  async findBySlug(@Param('slug') slug: string, @Query() query: CompanyDetailQueryDto) {
    const data = await this.companiesService.findBySlug(slug, query);
    return { data };
  }
}
