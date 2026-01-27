// src/product-review/controller/product-review.controller.ts
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
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { CreateProductReviewDto } from '../dto/create-product_review.dto';
import { UpdateProductReviewDto } from '../dto/update-product_review.dto';
import { ProductReviewQueryDto } from '../dto/query-product_review.dto';
import { ProductReviewService } from '../service/product_review.service';

@Controller('product-review')
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  @RequireResource('product-review', 'create')
  @Post()
  async create(@Body() createProductReviewDto: CreateProductReviewDto) {
    return this.productReviewService.create(
      createProductReviewDto,
    );
  }

  @Public()
  @Get()
  async findAll(@Query() query: ProductReviewQueryDto) {
    return this.productReviewService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productReviewService.findOne(id);
  }

  @RequireResource('product-review', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductReviewDto: UpdateProductReviewDto,
  ) {
    return this.productReviewService.update(
      id,
      updateProductReviewDto,
    );
  }

  @RequireResource('product-review', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productReviewService.remove(id);
  }

  @RequireResource('product-review', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productReviewService.restore(id);
  }

  // Utility endpoints
  @Public()
  @Get('product/:productId')
  async findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ProductReviewQueryDto,
  ) {
    return this.productReviewService.findByProduct(
      productId,
      query,
    );
  }

  @Public()
  @Get('product/:productId/average-rating')
  async getAverageRating(@Param('productId', ParseIntPipe) productId: number) {
    return this.productReviewService.getAverageRating(productId);
  }

  @RequirePermissions('read:product-review')
  @Get('stats/count')
  async getReviewsCount() {
    return this.productReviewService.getReviewsCount();
  }

  @RequirePermissions('read:product-review')
  @Get('stats/by-rating')
  async getReviewsByRating() {
    return this.productReviewService.getReviewsByRating();
  }
}
