import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CompareQueryDto } from './dto/compare-query.dto';

@ApiTags('analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Dashboard-level overview statistics' })
  async overview() {
    const data = await this.analyticsService.overview();
    return { data };
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare compensation statistics across companies' })
  async compare(@Query() query: CompareQueryDto) {
    const data = await this.analyticsService.compare(query);
    return { data };
  }
}
