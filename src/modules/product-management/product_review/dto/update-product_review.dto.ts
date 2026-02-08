import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductReviewDto {
  @ApiPropertyOptional({
    description: 'Review rating from 1 to 5 stars',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Reviewer name',
    example: 'Jane Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Review comment/feedback',
    example: 'Updated: Even better than expected!',
    type: String,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Product ID being reviewed',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  productId?: number;
}
