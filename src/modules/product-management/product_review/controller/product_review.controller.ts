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
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { CreateProductReviewDto } from '../dto/create-product_review.dto';
import { UpdateProductReviewDto } from '../dto/update-product_review.dto';
import { ProductReviewQueryDto } from '../dto/query-product_review.dto';
import { ProductReviewService } from '../service/product_review.service';

/**
 * Product Review Management Controller
 *
 * Handles all operations for product reviews including creation, retrieval, updates, and deletion.
 * Reviews support rating (1-5 stars), reviewer information, and comments.
 *
 * Endpoints: 5 core REST operations
 * - POST   /product-review       - Create review
 * - GET    /product-review       - List reviews with filtering (pagination, product, rating)
 * - GET    /product-review/:id   - Get single review
 * - PATCH  /product-review/:id   - Update review
 * - DELETE /product-review/:id   - Delete review (soft delete)
 *
 * Query Parameters (GET endpoint):
 * - page, limit: Pagination
 * - search: Search by reviewer name or comment
 * - productId: Filter by product
 * - rating: Filter by exact rating (1-5)
 * - minRating, maxRating: Filter by rating range
 * - sortBy: Sort field (createdAt, rating, name) - default: createdAt
 * - sortOrder: ASC or DESC - default: DESC
 */
@ApiBearerAuth()
@ApiTags('Product Reviews')
@Controller('product-review')
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  /**
   * POST /product-review
   * Create a new product review with rating and comment
   */
  @RequireResource('product-review', 'create')
  @Post()
  @ApiOperation({
    summary: 'Create product review',
    description: 'Create a new review for a product. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    schema: {
      example: {
        id: 1,
        rating: 4,
        name: 'John Doe',
        comment: 'Great product!',
        productId: 10,
        createdAt: '2026-01-30T10:00:00Z',
        updatedAt: '2026-01-30T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createProductReviewDto: CreateProductReviewDto) {
    return this.productReviewService.create(createProductReviewDto);
  }

  /**
   * GET /product-review
   * List all reviews with comprehensive filtering and pagination
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'List product reviews',
    description:
      'Retrieve all product reviews with support for filtering by product, rating range, sorting, and pagination. Use query parameters for filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            rating: 5,
            name: 'Alice',
            comment: 'Excellent!',
            productId: 10,
            createdAt: '2026-01-30T10:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          pages: 5,
        },
      },
    },
  })
  async findAll(@Query() query: ProductReviewQueryDto) {
    return this.productReviewService.findAll(query);
  }

  /**
   * GET /product-review/:id
   * Retrieve a single review by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Retrieve a specific product review by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Review found',
    schema: {
      example: {
        id: 1,
        rating: 5,
        name: 'Alice',
        comment: 'Excellent!',
        productId: 10,
        createdAt: '2026-01-30T10:00:00Z',
        updatedAt: '2026-01-30T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productReviewService.findOne(id);
  }

  /**
   * PATCH /product-review/:id
   * Update an existing review
   */
  @RequireResource('product-review', 'update')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update review',
    description:
      'Update an existing product review. Only rating, name, and comment can be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID to update',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductReviewDto: UpdateProductReviewDto,
  ) {
    return this.productReviewService.update(id, updateProductReviewDto);
  }

  /**
   * DELETE /product-review/:id
   * Delete (soft delete) a review
   */
  @RequireResource('product-review', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete review',
    description:
      'Soft delete a product review. Data is retained but marked as deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID to delete',
    example: 1,
    type: Number,
  })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productReviewService.remove(id);
  }
}
