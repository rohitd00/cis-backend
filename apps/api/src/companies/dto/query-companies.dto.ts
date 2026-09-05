import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class QueryCompaniesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Case-insensitive substring search on company name' })
  @IsOptional()
  @IsString()
  search?: string;
}
