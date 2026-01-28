import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({
    description: 'Product ID to add to wishlist',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;
}
