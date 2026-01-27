// src/coupon/controller/coupon.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CouponService } from '../service/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { CouponQueryDto } from '../dto/queryl-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @RequireResource('coupon', 'create')
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @RequirePermissions('read:coupon')
  @Get()
  async findAll(@Query() query: CouponQueryDto) {
    return this.couponService.findAll(query);
  }

  @RequirePermissions('read:coupon')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.findOne(id);
  }

  @RequireResource('coupon', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  @RequireResource('coupon', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.remove(id);
  }

  // Public endpoints
  @Public()
  @Post('validate')
  async validateCoupon(@Body() validateDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateDto);
  }

  @Public()
  @Get('public/active')
  async getActiveCoupons() {
    return this.couponService.getActiveCoupons();
  }

  // Admin utility endpoints
  @RequirePermissions('read:coupon')
  @Get('reports/stats')
  async getStats() {
    return this.couponService.getCouponStats();
  }

  @RequirePermissions('read:coupon')
  @Get('reports/expired')
  async getExpiredCoupons() {
    return this.couponService.getExpiredCoupons();
  }
}
