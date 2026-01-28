// src/attribute/dto/query-attribute.dto.ts
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';
import { AttributeType } from '../entity/attribute.entity';

/**
 * Attribute Query DTO - Supports advanced filtering
 * 
 * Usage examples:
 * - GET /attribute (paginated list)
 * - GET /attribute?page=1&limit=10 (pagination)
 * - GET /attribute?search=size (search by name)
 * - GET /attribute?type=SELECT (filter by type)
 * - GET /attribute?includeValues=true (include attribute values)
 */
export class AttributeQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Filter by attribute type',
    enum: AttributeType,
    example: 'SELECT',
  })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({
    description: 'Include attribute values in response',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  includeValues?: boolean;

  @ApiPropertyOptional({
    description: 'Include soft-deleted attributes in response',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  includeDeleted?: boolean;
}
