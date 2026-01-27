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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

/**
 * Coupon Controller - Optimized with 5 core endpoints + query support
 * 
 * Endpoints:
 * 1. POST /coupon - Create coupon
 * 2. GET /coupon - List coupons with advanced query filters
 * 3. GET /coupon/:id - Get single coupon
 * 4. PATCH /coupon/:id - Update coupon
 * 5. DELETE /coupon/:id - Delete coupon
 * 
 * Additional public endpoints:
 * - POST /coupon/validate - Validate coupon code
 * 
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by name/code)
 * - couponType (PERCENTAGE or FIXED)
 * - isActive (boolean)
 * - isExpired (boolean)
 */
@ApiTags('Product Management - Coupons')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * Create a new coupon
   * @param createCouponDto Coupon data
   */
  @ApiOperation({
    summary: 'Create a new coupon',
    description: 'Create a new discount coupon with percentage or fixed amount',
  })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Summer Sale 2026',
        code: 'SUMMER2026',
        couponType: 'PERCENTAGE',
        discountPercentage: 20,
        maxDiscountAmount: 100,
        minPurchase: 0,
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-06-30T23:59:59Z',
        maxUsageLimit: 100,
        createdAt: '2026-01-27T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  @RequireResource('coupon', 'create')
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  /**
   * Get coupons with advanced filtering and query support
   */
  @ApiOperation({
    summary: 'Get all coupons with advanced filtering',
    description:
      'Retrieve coupons with pagination and filtering by type, status, and code',
  })
  @ApiResponse({
    status: 200,
    description: 'List of coupons',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search by coupon name or code',
    example: 'SUMMER2026',
  })
  @ApiQuery({
    name: 'couponType',
    enum: ['PERCENTAGE', 'FIXED'],
    required: false,
    description: 'Filter by coupon type',
    example: 'PERCENTAGE',
  })
  @ApiQuery({
    name: 'isActive',
    type: Boolean,
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'isExpired',
    type: Boolean,
    required: false,
    description: 'Filter by expired status',
    example: false,
  })
  @RequirePermissions('read:coupon')
  @Get()
  async findAll(@Query() query: CouponQueryDto) {
    return this.couponService.findAll(query);
  }

  /**
   * Get single coupon by ID
   * @param id Coupon ID
   */
  @ApiOperation({
    summary: 'Get a single coupon',
    description: 'Retrieve a specific coupon with all details',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Coupon ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon found',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @RequirePermissions('read:coupon')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.findOne(id);
  }

  /**
   * Update coupon
   * @param id Coupon ID
   * @param updateCouponDto Updated coupon data
   */
  @ApiOperation({
    summary: 'Update a coupon',
    description: 'Update coupon details',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Coupon ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiBearerAuth()
  @RequireResource('coupon', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  /**
   * Delete coupon (soft delete)
   * @param id Coupon ID
   */
  @ApiOperation({
    summary: 'Delete a coupon',
    description: 'Soft delete a coupon',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Coupon ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Coupon deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiBearerAuth()
  @RequireResource('coupon', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.remove(id);
  }

  /**
   * Validate coupon code (public endpoint)
   * @param validateDto Validation request with code and amount
   */
  @ApiOperation({
    summary: 'Validate coupon code',
    description: 'Check if a coupon code is valid for the given amount',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon is valid',
    schema: {
      example: {
        isValid: true,
        discount: 20,
        discountAmount: 50,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon is invalid',
    schema: {
      example: {
        isValid: false,
        message: 'Coupon has expired',
      },
    },
  })
  @Public()
  @Post('validate')
  async validateCoupon(@Body() validateDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateDto);
  }
}
