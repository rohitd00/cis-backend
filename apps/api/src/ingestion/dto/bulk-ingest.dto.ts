import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export const MAX_BULK_RECORDS = 1000;

/**
 * Deliberately loose at the pipe level: `records` is validated as an array
 * with a bounded size here, but each element's shape (company/role/level/
 * baseSalary/...) is validated individually inside IngestionService.
 *
 * This is intentional, not an oversight — bulk ingestion must report
 * per-record success/failure ("2 of 100 rejected"), which is impossible if
 * a single malformed record trips whitelist/DTO validation and 400s the
 * entire batch before any record is processed.
 */
export class BulkIngestDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: 'Array of compensation records, same shape as POST /compensation body',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_BULK_RECORDS)
  @Type(() => Object)
  records!: Record<string, unknown>[];
}
