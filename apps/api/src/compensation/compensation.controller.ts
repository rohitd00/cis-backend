import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CompensationService } from './compensation.service';
import { CreateCompensationDto } from './dto/create-compensation.dto';
import { QueryCompensationDto } from './dto/query-compensation.dto';

@ApiTags('compensation')
@Controller('compensation')
export class CompensationController {
  constructor(private readonly compensationService: CompensationService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest a single compensation record' })
  @ApiResponse({ status: 201, description: 'Record created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Duplicate record' })
  async create(@Body() dto: CreateCompensationDto) {
    const record = await this.compensationService.create(dto);
    return { data: record };
  }

  @Get()
  @ApiOperation({ summary: 'Search/filter compensation records with pagination' })
  async findMany(@Query() query: QueryCompensationDto) {
    return this.compensationService.findMany(query);
  }
}
