import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../common/constants/currency.constant';

export class CompareQueryDto {
  @ApiProperty({
    description: 'Comma-separated company slugs, e.g. "google,microsoft"',
    example: 'google,microsoft',
  })
  @IsString()
  @IsNotEmpty()
  companySlugs!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    enum: SUPPORTED_CURRENCIES,
    description:
      'Required. Comparisons never mix currencies — pass the single currency to compare within.',
  })
  @IsIn(SUPPORTED_CURRENCIES)
  currency!: string;
}
