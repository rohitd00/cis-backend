import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../common/constants/currency.constant';

export class CompanyDetailQueryDto {
  @ApiPropertyOptional({ description: 'Scope statistics to a specific role' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Scope statistics to a specific level label' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Scope statistics to a specific city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    enum: SUPPORTED_CURRENCIES,
    description:
      'Restrict statistics to a single currency. If omitted, statistics are broken out per currency rather than blended together.',
  })
  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;
}
