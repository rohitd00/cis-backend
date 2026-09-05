import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CompensationModule } from '../compensation/compensation.module';

@Module({
  imports: [CompensationModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
