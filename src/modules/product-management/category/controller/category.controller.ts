// src/category/controller/category.controller.ts
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
import { CategoryService } from '../service/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { CategoryQueryDto } from '../dto/query-category.dto';

/**
 * Category Controller - Optimized with 5 core endpoints + query support
 *
 * Endpoints:
 * 1. POST /category - Create category
 * 2. GET /category - List categories with advanced query filters
 * 3. GET /category/:id - Get single category
 * 4. PATCH /category/:id - Update category
 * 5. DELETE /category/:id - Delete category
 *
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by name)
 * - rootOnly (boolean) - only root categories
 * - parentId (number) - filter by parent
 * - includeChildren (boolean) - include child categories
 * - tree (boolean) - return as tree structure
 * - includeProducts (boolean) - include products
 * - includeDeleted (boolean) - include soft-deleted
 */
@ApiTags('Product Management - Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   * @param createCategoryDto Category data
   */
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Create a new product category. Can be a root category or a subcategory.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Electronics',
        parentId: null,
        parent: null,
        children: [],
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  @ApiBearerAuth()
  @RequireResource('category', 'create')
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Get categories with advanced filtering and query support
   * Query options:
   * - GET /category (paginated list)
   * - GET /category?rootOnly=true (root categories)
   * - GET /category?tree=true (tree structure)
   * - GET /category?parentId=1 (categories by parent)
   * - GET /category?search=electronics (search by name)
   * - GET /category?includeChildren=true (with children)
   * - GET /category?includeProducts=true (with products)
   */
  @ApiOperation({
    summary: 'Get all categories with advanced filtering',
    description:
      'Retrieve categories with powerful query support. Supports pagination, search, filtering by parent, tree view, and data enrichment options.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    schema: {
      example: {
        items: [
          {
            id: 1,
            name: 'Electronics',
            parentId: null,
            parent: null,
            children: [],
            products: [],
          },
          {
            id: 2,
            name: 'Clothing',
            parentId: null,
            parent: null,
            children: [],
            products: [],
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
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
    description: 'Search by category name (case-insensitive)',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'rootOnly',
    type: Boolean,
    required: false,
    description: 'Return only root categories (no parent)',
    example: false,
  })
  @ApiQuery({
    name: 'parentId',
    type: Number,
    required: false,
    description: 'Filter by parent category ID',
    example: 1,
  })
  @ApiQuery({
    name: 'includeChildren',
    type: Boolean,
    required: false,
    description: 'Include child categories in response',
    example: false,
  })
  @ApiQuery({
    name: 'tree',
    type: Boolean,
    required: false,
    description: 'Return as hierarchical tree structure (ignores pagination)',
    example: false,
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
    description: 'Include soft-deleted categories',
    example: false,
  })
  @Public()
  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  /**
   * Get single category by ID
   * @param id Category ID
   */
  @ApiOperation({
    summary: 'Get a single category',
    description:
      'Retrieve a specific category with all its details including parent and children.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    schema: {
      example: {
        id: 1,
        name: 'Electronics',
        parentId: null,
        parent: null,
        children: [
          {
            id: 2,
            name: 'Phones',
          },
          {
            id: 3,
            name: 'Laptops',
          },
        ],
        createdAt: '2026-01-27T10:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @RequireResource('category', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  /**
   * Update category
   * @param id Category ID
   * @param updateCategoryDto Updated category data
   */
  @ApiOperation({
    summary: 'Update a category',
    description:
      'Update category name and/or parent. Prevents circular dependencies.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Electronics & Gadgets',
        parentId: 3,
        parent: {
          id: 3,
          name: 'Products',
        },
        children: [],
        updatedAt: '2026-01-27T11:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or circular dependency detected',
  })
  @ApiResponse({
    status: 404,
    description: 'Category or parent category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  @ApiBearerAuth()
  @RequireResource('category', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Delete category (soft delete)
   * @param id Category ID
   */
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Soft delete a category. Prevents deletion if category has children or associated products.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with children or products',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiBearerAuth()
  @RequireResource('category', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
