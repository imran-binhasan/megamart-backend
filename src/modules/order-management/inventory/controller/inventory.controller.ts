// src/inventory/controller/inventory.controller.ts
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
import { InventoryService } from '../service/inventory.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { StockAdjustmentDto } from '../dto/stock-adjustment.dto';

import {
  RequirePermissions,
  RequireResource,
} from 'src/core/auth/decorator/auth.decorator';
import { InventoryQueryDto } from '../dto/query-inventory.dto';

/**
 * Inventory Management Controller
 *
 * Handles all inventory operations including stock tracking, adjustments, and reorder management.
 * Supports location-based inventory tracking and stock transaction history.
 *
 * Endpoints: 5 core REST operations (plus stock adjustment via PATCH)
 * - POST   /inventory       - Create inventory record
 * - GET    /inventory       - List inventory with filtering (pagination, product, location, low stock)
 * - GET    /inventory/:id   - Get single inventory record
 * - PATCH  /inventory/:id   - Update inventory settings (reorder level, location)
 * - DELETE /inventory/:id   - Delete inventory record (soft delete)
 *
 * Query Parameters (GET endpoint):
 * - page, limit: Pagination
 * - search: Search by product name
 * - productId: Filter by product
 * - location: Filter by storage location
 * - lowStock: Show only items below reorder level
 */
@ApiBearerAuth()
@ApiTags('Inventory Management')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * POST /inventory
   * Create a new inventory record for a product
   */
  @RequireResource('inventory', 'create')
  @Post()
  @ApiOperation({
    summary: 'Create inventory record',
    description:
      'Create a new inventory record for a product with initial stock, reorder level, and location.',
  })
  @ApiResponse({
    status: 201,
    description: 'Inventory record created successfully',
    schema: {
      example: {
        id: 1,
        productId: 10,
        quantity: 100,
        reorderLevel: 20,
        location: 'Warehouse A, Shelf 5',
        createdAt: '2026-01-30T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or product not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  /**
   * GET /inventory
   * List all inventory records with filtering and pagination
   */
  @RequirePermissions('read:inventory')
  @Get()
  @ApiOperation({
    summary: 'List inventory records',
    description:
      'Retrieve all inventory records with support for filtering by product, location, and low stock status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory records retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            productId: 10,
            quantity: 100,
            reorderLevel: 20,
            location: 'Warehouse A',
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
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  /**
   * GET /inventory/:id
   * Retrieve a single inventory record by ID
   */
  @RequirePermissions('read:inventory')
  @Get(':id')
  @ApiOperation({
    summary: 'Get inventory record by ID',
    description:
      'Retrieve a specific inventory record with all details and transaction history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Inventory record ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory record found',
    schema: {
      example: {
        id: 1,
        productId: 10,
        quantity: 100,
        reorderLevel: 20,
        location: 'Warehouse A',
        createdAt: '2026-01-30T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Inventory record not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  /**
   * PATCH /inventory/:id
   * Update inventory settings or adjust stock
   */
  @RequireResource('inventory', 'update')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update inventory record',
    description:
      'Update inventory settings (reorder level, location) or adjust stock quantity. Use body to adjust stock or query to update settings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Inventory record ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Inventory record not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  /**
   * PATCH /inventory/:id/adjust (merged into PATCH :id)
   * Adjust stock quantity with transaction tracking
   * Note: Send StockAdjustmentDto body to trigger stock adjustment instead of UpdateInventoryDto
   */
  @RequireResource('inventory', 'update')
  @Patch(':id/adjust-stock')
  @ApiOperation({
    summary: 'Adjust inventory stock',
    description:
      'Adjust stock quantity (IN, OUT, ADJUSTMENT) with reason tracking and transaction history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Inventory record ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid adjustment' })
  @ApiResponse({ status: 404, description: 'Inventory record not found' })
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustmentDto: StockAdjustmentDto,
  ) {
    return this.inventoryService.adjustStock(id, adjustmentDto);
  }

  /**
   * DELETE /inventory/:id
   * Delete (soft delete) an inventory record
   */
  @RequireResource('inventory', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete inventory record',
    description:
      'Soft delete an inventory record. Data is retained but marked as deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Inventory record ID to delete',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Inventory record deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Inventory record not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
