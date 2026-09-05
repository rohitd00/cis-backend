import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CompensationService } from '../compensation/compensation.service';
import { CreateCompensationDto } from '../compensation/dto/create-compensation.dto';

export interface BulkIngestError {
  index: number;
  message: string;
}

export interface BulkIngestResult {
  total: number;
  inserted: number;
  duplicates: number;
  rejected: number;
  errors: BulkIngestError[];
}

/**
 * Bulk ingestion validates and persists each record independently:
 * one malformed or duplicate record is rejected/counted without aborting
 * the rest of the batch. Each successful record still goes through the
 * full single-record pipeline (normalization, duplicate check, calculation)
 * inside its own database transaction — this is NOT a blind bulk insert.
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly compensationService: CompensationService) {}

  async bulkIngest(rawRecords: Record<string, unknown>[]): Promise<BulkIngestResult> {
    const result: BulkIngestResult = {
      total: rawRecords.length,
      inserted: 0,
      duplicates: 0,
      rejected: 0,
      errors: [],
    };

    for (let index = 0; index < rawRecords.length; index++) {
      const raw = rawRecords[index];

      const dto = plainToInstance(CreateCompensationDto, raw, {
        enableImplicitConversion: true,
      });
      const validationErrors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      if (validationErrors.length > 0) {
        result.rejected++;
        const message = validationErrors
          .map((error) => Object.values(error.constraints ?? {}).join(', '))
          .join('; ');
        result.errors.push({ index, message: message || 'Validation failed' });
        continue;
      }

      try {
        await this.compensationService.create(dto);
        result.inserted++;
      } catch (error) {
        if (error instanceof ConflictException) {
          result.duplicates++;
        } else {
          result.rejected++;
          const message = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({ index, message });
          this.logger.warn(`Bulk ingestion record ${index} failed: ${message}`);
        }
      }
    }

    this.logger.log(
      `Bulk ingestion completed: ${result.inserted} inserted, ${result.duplicates} duplicates, ${result.rejected} rejected out of ${result.total}`,
    );

    return result;
  }
}
