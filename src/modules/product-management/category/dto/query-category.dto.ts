// src/category/dto/category-query.dto.ts
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

/**
 * Category Query DTO - Supports advanced filtering
 *
 * Usage examples:
 * - GET /category (paginated list)
 * - GET /category?page=1&limit=10 (pagination)
 * - GET /category?search=electronics (search by name)
 * - GET /category?rootOnly=true (only root categories)
 * - GET /category?parentId=5 (categories by parent)
 * - GET /category?includeChildren=true (include child categories)
 * - GET /category?tree=true (tree structure format)
 * - GET /category?includeProducts=true (include related products)
 * - GET /category?includeDeleted=true (include soft-deleted categories)
 */
export class CategoryQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Parent category ID to filter by',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Return only root categories (no parent)',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  rootOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Include child categories in response',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description:
      'Return categories as hierarchical tree structure (ignores pagination)',
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
  tree?: boolean;

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
    description: 'Include soft-deleted categories in response',
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
