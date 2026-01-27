// src/attribute/controller/attribute.controller.ts
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
import { AttributeService } from '../service/attribute.service';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @RequireResource('attribute', 'create')
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @RequirePermissions('read:attribute', 'list:attribute')
  @Get()
  async findAll(@Query() query: PaginationQuery) {
    return this.attributeService.findAll(query);
  }

  @Public()
  @Get('all')
  async findAllWithoutPagination() {
    return this.attributeService.findAllWithoutPagination();
  }

  @RequireResource('attribute', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.findOne(id);
  }

  @RequireResource('attribute', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributeService.update(id, updateAttributeDto);
  }

  @RequireResource('attribute', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.remove(id);
  }

  @RequireResource('attribute', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.restore(id);
  }

  // Utility endpoints
  @Public()
  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    return this.attributeService.findByType(type);
  }

  @RequirePermissions('read:attribute')
  @Get('stats/count')
  async getAttributesCount() {
    const result = await this.attributeService.getAttributesCount();
    return { count: result };
  }
}
