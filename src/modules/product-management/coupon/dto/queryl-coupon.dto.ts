import {
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';
import { CouponType } from '../entity/coupon.entity';

export class CouponQueryDto extends PaginationQuery {
  @ApiPropertyOptional({
    description: 'Filter by coupon type',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(CouponType)
  couponType?: CouponType;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by expired status',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isExpired?: boolean;
}
