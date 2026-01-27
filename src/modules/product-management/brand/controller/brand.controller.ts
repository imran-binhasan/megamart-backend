// src/brand/controller/brand.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
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
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandService } from '../service/brand.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { BrandQueryDto } from '../dto/query-brand.dto';

/**
 * Brand Controller - Optimized with 5 core endpoints + query support
 * 
 * Endpoints:
 * 1. POST /brand - Create brand
 * 2. GET /brand - List brands with advanced query filters
 * 3. GET /brand/:id - Get single brand
 * 4. PATCH /brand/:id - Update brand
 * 5. DELETE /brand/:id - Delete brand
 * 
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by name)
 * - includeProducts (boolean) - include products
 * - includeDeleted (boolean) - include soft-deleted
 */
@ApiTags('Product Management - Brands')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  /**
   * Create a new brand
   * @param createBrandDto Brand data
   * @param logo Optional brand logo image
   */
  @ApiOperation({
    summary: 'Create a new brand',
    description: 'Create a new product brand with optional logo image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Samsung',
        description: 'Samsung is a leading electronics manufacturer',
        logoUrl: 'https://...',
        createdAt: '2026-01-27T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  @RequireResource('brand', 'create')
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.brandService.create(createBrandDto, logo);
  }

  /**
   * Get brands with advanced filtering and query support
   */
  @ApiOperation({
    summary: 'Get all brands with advanced filtering',
    description:
      'Retrieve brands with pagination and optional data enrichment',
  })
  @ApiResponse({
    status: 200,
    description: 'List of brands',
    schema: {
      example: {
        items: [
          {
            id: 1,
            name: 'Samsung',
            description: 'Samsung is a leading electronics manufacturer',
            logoUrl: 'https://...',
            products: [],
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      },
    },
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
    description: 'Search by brand name (case-insensitive)',
    example: 'samsung',
  })
  @ApiQuery({
    name: 'includeProducts',
    type: Boolean,
    required: false,
    description: 'Include related products in response',
    example: false,
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: Boolean,
    required: false,
    description: 'Include soft-deleted brands',
    example: false,
  })
  @Public()
  @Get()
  async findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query);
  }

  /**
   * Get single brand by ID
   * @param id Brand ID
   */
  @ApiOperation({
    summary: 'Get a single brand',
    description: 'Retrieve a specific brand with all its details',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Brand ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Brand found',
    schema: {
      example: {
        id: 1,
        name: 'Samsung',
        description: 'Samsung is a leading electronics manufacturer',
        logoUrl: 'https://...',
        createdAt: '2026-01-27T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @RequireResource('brand', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  /**
   * Update brand
   * @param id Brand ID
   * @param updateBrandDto Updated brand data
   * @param logo Optional new logo image
   */
  @ApiOperation({
    summary: 'Update a brand',
    description: 'Update brand details and/or logo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Brand ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiBearerAuth()
  @RequireResource('brand', 'update')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.brandService.update(id, updateBrandDto, logo);
  }

  /**
   * Delete brand (soft delete)
   * @param id Brand ID
   */
  @ApiOperation({
    summary: 'Delete a brand',
    description: 'Soft delete a brand',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Brand ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiBearerAuth()
  @RequireResource('brand', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}
