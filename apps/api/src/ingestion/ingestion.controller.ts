import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IngestionService } from './ingestion.service';
import { BulkIngestDto } from './dto/bulk-ingest.dto';

@ApiTags('ingestion')
@Controller('ingestion/compensation')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('bulk')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk-ingest compensation records with a per-record summary' })
  async bulk(@Body() dto: BulkIngestDto) {
    return this.ingestionService.bulkIngest(dto.records);
  }
}
