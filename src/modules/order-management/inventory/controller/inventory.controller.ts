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
import { InventoryService } from '../service/inventory.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { StockAdjustmentDto } from '../dto/stock-adjustment.dto';

import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { InventoryQueryDto } from '../dto/query-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequireResource('inventory', 'create')
  @Post()
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @RequirePermissions('read:inventory')
  @Get()
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @RequirePermissions('read:inventory')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @RequireResource('inventory', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @RequireResource('inventory', 'update')
  @Patch(':id/adjust-stock')
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustmentDto: StockAdjustmentDto,
  ) {
    return this.inventoryService.adjustStock(id, adjustmentDto);
  }

  @RequireResource('inventory', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }

  // Utility endpoints
  @RequirePermissions('read:inventory')
  @Get('product/:productId')
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findByProductId(productId);
  }

  @RequirePermissions('read:inventory')
  @Get('reports/low-stock')
  async getLowStockItems(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockItems(threshold);
  }

  @RequirePermissions('read:inventory')
  @Get('reports/stats')
  async getStats() {
    return this.inventoryService.getInventoryStats();
  }
}
