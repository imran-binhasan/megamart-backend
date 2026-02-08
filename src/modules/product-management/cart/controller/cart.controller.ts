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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  RequirePermissions,
  RequireResource,
  CustomerOnly,
} from 'src/core/auth/decorator/auth.decorator';
import { CurrentUser } from 'src/core/auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from 'src/core/auth/interface/auth-user.interface';
import { CartService } from '../service/cart.service';
import { CreateCartDto } from '../dto/create-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { CartQueryDto } from '../dto/query-cart.dto';
import { Cart } from '../entity/cart.entity';

/**
 * Cart Controller - Optimized with 5 core endpoints + query support + customer endpoints
 *
 * Core Endpoints (5):
 * 1. POST /cart - Add item to cart (customer only)
 * 2. GET /cart - List cart items with advanced query filters (admin)
 * 3. GET /cart/:id - Get single cart item
 * 4. PATCH /cart/:id - Update cart item quantity
 * 5. DELETE /cart/:id - Remove cart item
 *
 * Customer-Only Endpoints:
 * - GET /cart/my-cart - Get authenticated user's cart (via query)
 * - GET /cart/my-cart/total - Get cart total
 * - GET /cart/my-cart/count - Get cart items count
 * - DELETE /cart/clear/my-cart - Clear entire cart
 *
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by product name)
 * - customerId (filter by customer)
 * - productId (filter by product)
 */
@ApiTags('Product Management - Cart')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Admin endpoints for cart management
  @ApiOperation({
    summary: 'Get all cart items (Admin)',
    description:
      'Retrieve all cart items with filtering and pagination. Requires admin permissions.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Cart items retrieved successfully',
    type: [Cart],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin permissions',
  })
  @RequirePermissions('read:cart', 'list:cart')
  @Get()
  async findAll(@Query() query: CartQueryDto) {
    return this.cartService.findAll(query);
  }

  /**
   * Get single cart item
   */
  @ApiOperation({
    summary: 'Get a cart item',
    description: 'Retrieve a specific cart item by ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item found',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  @RequireResource('cart', 'read')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.cartService.findOne(id);
  }

  /**
   * Update cart item quantity
   */
  @ApiOperation({
    summary: 'Update cart item quantity',
    description:
      'Update quantity for a specific cart item. Invalidates all cart caches.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity updated successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Not your cart item or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @RequireResource('cart', 'update')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.updateQuantity(id, updateCartDto);
  }

  /**
   * Delete/Remove cart item
   */
  @ApiOperation({
    summary: 'Remove item from cart',
    description:
      'Remove a specific item from cart. Invalidates all cart caches.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Item removed from cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Not your cart item',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @RequireResource('cart', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number) {
    await this.cartService.remove(id);
  }

  // Customer endpoints
  @CustomerOnly()
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      "Add a product to the authenticated customer's cart. If the product already exists, quantity will be increased. Cached for 5 minutes.",
  })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or insufficient stock',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Post()
  async addToCart(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addToCart(user.id, createCartDto);
  }

  @CustomerOnly()
  @Get('my-cart')
  @ApiOperation({
    summary: 'Get my cart items',
    description:
      "Retrieve all items in the authenticated customer's cart. Cached for 5 minutes.",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart items retrieved successfully',
    type: [Cart],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.findByCustomer(user.id);
  }

  @CustomerOnly()
  @Get('my-cart/total')
  @ApiOperation({
    summary: 'Get cart total',
    description:
      "Calculate total price and item count for authenticated customer's cart. Cached for 5 minutes.",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart total retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyCartTotal(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCartTotal(user.id);
  }

  @CustomerOnly()
  @Get('my-cart/count')
  @ApiOperation({
    summary: 'Get cart items count',
    description:
      "Get the number of items in authenticated customer's cart. Cached for 3 minutes.",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart items count retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyCartItemsCount(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCartItemsCount(user.id);
  }

  @CustomerOnly()
  @Delete('clear/my-cart')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear entire cart',
    description:
      "Remove all items from authenticated customer's cart. Invalidates all cart caches.",
  })
  @ApiResponse({ status: 204, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearMyCart(@CurrentUser() user: AuthenticatedUser) {
    await this.cartService.clearCart(user.id);
  }

  @CustomerOnly()
  @Patch(':id/quantity')
  @ApiOperation({
    summary: 'Update my cart item quantity',
    description:
      'Update quantity for a specific cart item in your cart. Invalidates all cart caches.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity updated successfully',
    type: Cart,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Not your cart item or insufficient stock',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateMyCartItemQuantity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    // First verify the cart item belongs to the current user
    const cartItem = await this.cartService.findOne(id);
    if (cartItem.customerId !== user.id) {
      throw new BadRequestException('You can only update your own cart items');
    }

    return this.cartService.updateQuantity(id, updateCartDto);
  }

  @CustomerOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove item from my cart',
    description:
      "Remove a specific item from authenticated customer's cart. Invalidates all cart caches.",
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Item removed from cart successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Not your cart item' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromMyCart(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: number,
  ) {
    // First verify the cart item belongs to the current user
    const cartItem = await this.cartService.findOne(id);
    if (cartItem.customerId !== user.id) {
      throw new BadRequestException('You can only remove your own cart items');
    }

    await this.cartService.remove(id);
  }
}
