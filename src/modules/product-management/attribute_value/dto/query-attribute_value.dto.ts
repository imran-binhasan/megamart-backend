// src/attribute_value/dto/attribute-value-query.dto.ts
import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

/**
 * Attribute Value Query DTO - Supports advanced filtering
 *
 * Usage examples:
 * - GET /attribute-value (paginated list)
 * - GET /attribute-value?page=1&limit=10 (pagination)
 * - GET /attribute-value?search=red (search by value)
 * - GET /attribute-value?attributeId=5 (filter by attribute)
 */
export class AttributeValueQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Filter by attribute ID',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  attributeId?: number;

  @ApiPropertyOptional({
    description: 'Include soft-deleted attribute values',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  includeDeleted?: boolean;
}
