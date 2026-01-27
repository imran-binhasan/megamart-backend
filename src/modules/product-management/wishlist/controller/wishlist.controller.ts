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
import { WishlistService } from '../service/wishlist.service';
import { CreateWishlistDto } from '../dto/create-wishlist.dto';
import { UpdateWishlistDto } from '../dto/update-wishlist.dto';
import {
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { WishlistQueryDto } from '../dto/query-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @RequireResource('wishlist', 'create')
  @Post()
  async create(@Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistService.create(createWishlistDto);
  }

  @RequireResource('wishlist', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistService.update(id, updateWishlistDto);
  }

  @RequireResource('wishlist', 'read')
  @Get()
  async findAll(@Query() query: WishlistQueryDto) {
    return this.wishlistService.findAll(query);
  }

  @RequireResource('wishlist', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.findOne(id);
  }

  @RequireResource('wishlist', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.remove(id);
  }

  @RequireResource('wishlist', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.restore(id);
  }

  // Customer-specific endpoints
  @RequireResource('wishlist', 'read')
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.wishlistService.findByCustomerId(customerId);
  }

  @RequireResource('wishlist', 'delete')
  @Delete('customer/:customerId/product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByCustomerAndProduct(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeByCustomerAndProduct(
      customerId,
      productId,
    );
  }

  @RequireResource('wishlist', 'delete')
  @Delete('customer/:customerId/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCustomerWishlist(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.wishlistService.clearCustomerWishlist(customerId);
  }

  // Utility endpoints
  @RequireResource('wishlist', 'read')
  @Get('customer/:customerId/count')
  async getWishlistCount(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    const result = await this.wishlistService.getWishlistCount(customerId);
    return { count: result };
  }

  @RequireResource('wishlist', 'read')
  @Get('customer/:customerId/product/:productId/check')
  async isProductInWishlist(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const result = await this.wishlistService.isProductInWishlist(
      customerId,
      productId,
    );
    return { inWishlist: result };
  }
}
