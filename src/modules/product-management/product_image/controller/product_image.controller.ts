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
  Public,
  RequireResource,
} from 'src/core/auth/decorator/auth.decorator';
import { ProductImageService } from '../service/product_image.service';
import { CreateProductImageDto } from '../dto/create-product_image.dto';
import { UpdateProductImageDto } from '../dto/update-product_image.dto';
import { ProductImageQueryDto } from '../dto/query-product_image.dto';

@Controller('products/:productId/images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  // GET /products/:productId/images - List images for a product
  @Public()
  @Get()
  async findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query?: ProductImageQueryDto,
  ) {
    const result = await this.productImageService.findByProduct(
      productId,
      query,
    );
    return {
      success: true,
      message: 'Product images retrieved successfully',
      data: result,
    };
  }

  // POST /products/:productId/images - Create image for product
  @RequireResource('product_image', 'create')
  @Post()
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createProductImageDto: CreateProductImageDto,
  ) {
    const result = await this.productImageService.create({
      ...createProductImageDto,
      productId,
    });
    return {
      success: true,
      message: 'Product image created successfully',
      data: result,
    };
  }

  // GET /products/:productId/images/:imageId - Get single image
  @Public()
  @Get(':imageId')
  async findOne(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    const result = await this.productImageService.findOneByProduct(
      imageId,
      productId,
    );
    return {
      success: true,
      message: 'Product image retrieved successfully',
      data: result,
    };
  }

  // PATCH /products/:productId/images/:imageId - Update image (including isPrimary)
  @RequireResource('product_image', 'update')
  @Patch(':imageId')
  async update(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ) {
    const result = await this.productImageService.updateByProduct(
      imageId,
      productId,
      updateProductImageDto,
    );
    return {
      success: true,
      message: 'Product image updated successfully',
      data: result,
    };
  }

  // DELETE /products/:productId/images/:imageId - Delete image
  @RequireResource('product_image', 'delete')
  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    await this.productImageService.removeByProduct(imageId, productId);
    return {
      success: true,
      message: 'Product image deleted successfully',
    };
  }

  // POST /products/:productId/images/reorder - Batch reorder images (optional bulk operation)
  @RequireResource('product_image', 'update')
  @Post('reorder')
  async reorderImages(
    @Param('productId', ParseIntPipe) productId: number,
    @Body('imageIds') imageIds: number[],
  ) {
    const result = await this.productImageService.reorderImages(
      productId,
      imageIds,
    );
    return {
      success: true,
      message: 'Images reordered successfully',
      data: result,
    };
  }
}
