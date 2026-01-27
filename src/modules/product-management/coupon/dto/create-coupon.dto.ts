import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDate,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '../entity/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon name/title',
    type: String,
    example: 'Summer Sale 2026',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique coupon code',
    type: String,
    example: 'SUMMER2026',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Type of coupon discount',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @IsEnum(CouponType)
  couponType: CouponType;

  @ApiPropertyOptional({
    description: 'Minimum purchase amount required',
    type: Number,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPurchase?: number = 0;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (applies for percentage coupons)',
    type: Number,
    minimum: 0,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100, required if couponType is PERCENTAGE)',
    type: Number,
    minimum: 0,
    maximum: 100,
    example: 20,
  })
  @ValidateIf((o) => o.couponType === CouponType.PERCENTAGE)
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Fixed discount amount (required if couponType is FIXED)',
    type: Number,
    minimum: 0,
    example: 50,
  })
  @ValidateIf((o) => o.couponType === CouponType.FIXED)
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @ApiProperty({
    description: 'Coupon start date',
    type: Date,
    example: '2026-06-01T00:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Coupon end date',
    type: Date,
    example: '2026-06-30T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Maximum number of times this coupon can be used',
    type: Number,
    minimum: 1,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxUsageLimit?: number;
}
