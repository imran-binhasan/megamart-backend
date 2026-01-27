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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { RequireResource, Public } from 'src/core/auth/decorator/auth.decorator';
import { ProductQueryDto } from '../dto/query-product.dto';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product with auto-generated SKU and slug if not provided. Requires product:create permission.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        success: true,
        message: 'Product created successfully',
        data: {
          id: 1,
          name: 'Premium Wireless Headphones',
          sku: 'CAT1-PREMIUM-ABC123',
          slug: 'premium-wireless-headphones',
          price: 149.99,
          stock: 50,
          status: 'active',
          condition: 'new',
          visibility: 'public',
          isFeatured: false,
          isPublished: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Product with same name/SKU/slug already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBearerAuth()
  @RequireResource('product', 'create')
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @ApiOperation({
    summary: 'Get all products with filtering',
    description:
      'Retrieves paginated list of products with advanced filtering options (category, brand, price range, status, etc.)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or description',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    type: Number,
    description: 'Filter by brand ID',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    description: 'Product status',
  })
  @ApiQuery({
    name: 'condition',
    required: false,
    enum: [
      'new',
      'refurbished',
      'used_like_new',
      'used_good',
      'used_acceptable',
    ],
    description: 'Product condition',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter by stock availability',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Products retrieved successfully',
        data: {
          items: [
            {
              id: 1,
              name: 'Premium Wireless Headphones',
              sku: 'CAT1-PREMIUM-ABC123',
              slug: 'premium-wireless-headphones',
              price: 149.99,
              stock: 50,
              status: 'active',
              avgRating: 4.5,
              reviewCount: 128,
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 156,
            totalPages: 16,
          },
        },
      },
    },
  })
  @Public()
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Retrieves a single product with all details including category, brand, images, and attributes',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Product retrieved successfully',
        data: {
          id: 1,
          name: 'Premium Wireless Headphones',
          description:
            'High-quality wireless headphones with noise cancellation',
          sku: 'CAT1-PREMIUM-ABC123',
          slug: 'premium-wireless-headphones',
          price: 149.99,
          compareAtPrice: 199.99,
          stock: 50,
          status: 'active',
          condition: 'new',
          avgRating: 4.5,
          reviewCount: 128,
          viewCount: 1523,
          salesCount: 89,
          category: { id: 1, name: 'Electronics' },
          brand: { id: 5, name: 'AudioTech' },
          images: [],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update product',
    description:
      'Updates product details. All fields are optional. Requires product:update permission.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - name/SKU/slug already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBearerAuth()
  @RequireResource('product', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @ApiOperation({
    summary: 'Delete product (soft delete)',
    description:
      'Soft deletes a product. Can be restored later. Requires product:delete permission.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBearerAuth()
  @RequireResource('product', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
