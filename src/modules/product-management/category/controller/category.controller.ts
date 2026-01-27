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
import { CategoryService } from '../service/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { CategoryQueryDto } from '../dto/query-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @RequireResource('category', 'create')
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @RequirePermissions('read:category', 'list:category')
  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Public()
  @Get('all')
  async findAllWithoutPagination() {
    return this.categoryService.findAllWithoutPagination();
  }

  @Public()
  @Get('tree')
  async getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Public()
  @Get('root')
  async getRootCategories() {
    return this.categoryService.getRootCategories();
  }

  @RequireResource('category', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @RequireResource('category', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @RequireResource('category', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }

  @RequireResource('category', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.restore(id);
  }

  // Utility endpoints
  @Public()
  @Get(':id/children')
  async getChildCategories(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getChildCategories(id);
  }

  @RequireResource('category', 'read')
  @Get(':id/products')
  async findWithProducts(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findWithProducts(id);
  }

  @RequirePermissions('read:category')
  @Get('stats/count')
  async getCategoriesCount() {
    const result = await this.categoryService.getCategoriesCount();
    return { count: result };
  }
}
