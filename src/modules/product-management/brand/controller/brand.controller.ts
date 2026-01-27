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
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandService } from '../service/brand.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @RequireResource('brand', 'create')
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.brandService.create(createBrandDto, logo);
  }

  @RequirePermissions('read:brand', 'list:brand')
  @Get()
  async findAll(@Query() query: PaginationQuery) {
    return this.brandService.findAll(query);
  }

  @Public()
  @Get('all')
  async findAllWithoutPagination() {
    return this.brandService.findAllWithoutPagination();
  }

  @RequireResource('brand', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

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

  @RequireResource('brand', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }

  @RequireResource('brand', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.restore(id);
  }

  // Utility endpoints
  @RequireResource('brand', 'read')
  @Get(':id/products')
  async findWithProducts(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findWithProducts(id);
  }

  @RequirePermissions('read:brand')
  @Get('stats/count')
  async getBrandsCount() {
    const result = await this.brandService.getBrandsCount();
    return { count: result };
  }
}
