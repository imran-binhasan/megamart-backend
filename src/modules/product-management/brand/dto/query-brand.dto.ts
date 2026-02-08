// src/brand/dto/query-brand.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

/**
 * Brand Query DTO - Supports advanced filtering
 *
 * Usage examples:
 * - GET /brand (paginated list)
 * - GET /brand?page=1&limit=10 (pagination)
 * - GET /brand?search=samsung (search by name)
 * - GET /brand?includeProducts=true (include related products)
 */
export class BrandQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Include related products in response',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeProducts?: boolean;

  @ApiPropertyOptional({
    description: 'Include soft-deleted brands in response',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeDeleted?: boolean;
}
