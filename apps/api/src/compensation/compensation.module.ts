import { Module } from '@nestjs/common';
import { CompensationController } from './compensation.controller';
import { CompensationService } from './compensation.service';
import { CompensationCalculatorService } from './compensation-calculator.service';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { NormalizationModule } from '../normalization/normalization.module';

@Module({
  imports: [NormalizationModule],
  controllers: [CompensationController],
  providers: [CompensationService, CompensationCalculatorService, DuplicateDetectionService],
  exports: [CompensationService, CompensationCalculatorService, DuplicateDetectionService],
})
export class CompensationModule {}
