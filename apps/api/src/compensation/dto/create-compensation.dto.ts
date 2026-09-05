import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../common/constants/currency.constant';

/**
 * Input contract for a single compensation observation.
 *
 * Notably absent: `totalCompensation`. The client is never trusted to
 * supply the authoritative total — it is always calculated server-side by
 * CompensationCalculatorService. Any `totalCompensation` field in the raw
 * request body is silently dropped by ValidationPipe's whitelist mode.
 */
export class CreateCompensationDto {
  @ApiProperty({ example: 'Google' })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiProperty({ example: 'L4', description: 'Raw level label as used by the company' })
  @IsString()
  @IsNotEmpty()
  level!: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiPropertyOptional({ example: 'Karnataka' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Bangalore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'INR', enum: SUPPORTED_CURRENCIES })
  @IsIn(SUPPORTED_CURRENCIES)
  currency!: string;

  @ApiProperty({ example: 3500000, minimum: 0 })
  @IsNumber()
  @Min(0)
  baseSalary!: number;

  @ApiPropertyOptional({ example: 500000, minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiPropertyOptional({ example: 1000000, minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'synthetic', default: 'synthetic' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
