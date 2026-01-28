// src/cart/dto/cart-query.dto.ts
import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

/**
 * Cart Query DTO - Supports advanced filtering
 * 
 * Usage examples:
 * - GET /cart (all carts for admin)
 * - GET /cart?page=1&limit=10 (pagination)
 * - GET /cart?customerId=5 (filter by customer)
 * - GET /cart?productId=10 (filter by product)
 * - GET /cart?search=laptop (search by product name)
 */
export class CartQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Filter by customer ID',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by product ID',
    type: Number,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  productId?: number;
}
