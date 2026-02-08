import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WishlistService } from '../service/wishlist.service';
import { CreateWishlistDto } from '../dto/create-wishlist.dto';
import { UpdateWishlistDto } from '../dto/update-wishlist.dto';
import {
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { WishlistQueryDto } from '../dto/query-wishlist.dto';

/**
 * Wishlist Controller - Optimized with 5 core endpoints + query support
 *
 * Endpoints:
 * 1. POST /wishlist - Create wishlist item
 * 2. GET /wishlist - List wishlist items with advanced query filters
 * 3. GET /wishlist/:id - Get single wishlist item
 * 4. PATCH /wishlist/:id - Update wishlist item
 * 5. DELETE /wishlist/:id - Delete wishlist item
 *
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by product name)
 * - customerId (filter by customer)
 * - productId (filter by product)
 */
@ApiTags('Product Management - Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Create a new wishlist item
   * @param createWishlistDto Wishlist data
   */
  @ApiOperation({
    summary: 'Add product to wishlist',
    description: 'Add a product to a customer wishlist',
  })
  @ApiResponse({
    status: 201,
    description: 'Product added to wishlist successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  @RequireResource('wishlist', 'create')
  @Post()
  async create(@Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistService.create(createWishlistDto);
  }

  /**
   * Get wishlist items with advanced filtering and query support
   */
  @ApiOperation({
    summary: 'Get all wishlist items with advanced filtering',
    description:
      'Retrieve wishlist items with pagination and filtering by customer or product',
  })
  @ApiResponse({
    status: 200,
    description: 'List of wishlist items',
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
    description: 'Search by product name',
    example: 'laptop',
  })
  @ApiQuery({
    name: 'customerId',
    type: Number,
    required: false,
    description: 'Filter by customer ID',
    example: 5,
  })
  @ApiQuery({
    name: 'productId',
    type: Number,
    required: false,
    description: 'Filter by product ID',
    example: 10,
  })
  @RequireResource('wishlist', 'read')
  @Get()
  async findAll(@Query() query: WishlistQueryDto) {
    return this.wishlistService.findAll(query);
  }

  /**
   * Get single wishlist item by ID
   * @param id Wishlist item ID
   */
  @ApiOperation({
    summary: 'Get a single wishlist item',
    description: 'Retrieve a specific wishlist item',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Wishlist item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item found',
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist item not found',
  })
  @RequireResource('wishlist', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.findOne(id);
  }

  /**
   * Update wishlist item
   * @param id Wishlist item ID
   * @param updateWishlistDto Updated wishlist data
   */
  @ApiOperation({
    summary: 'Update a wishlist item',
    description: 'Update wishlist item details',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Wishlist item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist item not found',
  })
  @ApiBearerAuth()
  @RequireResource('wishlist', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistService.update(id, updateWishlistDto);
  }

  /**
   * Delete wishlist item (soft delete)
   * @param id Wishlist item ID
   */
  @ApiOperation({
    summary: 'Remove product from wishlist',
    description: 'Soft delete a wishlist item',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Wishlist item ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Product removed from wishlist successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist item not found',
  })
  @ApiBearerAuth()
  @RequireResource('wishlist', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.remove(id);
  }
}
