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
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { AttributeValueService } from '../service/attribute_value.service';
import { CreateAttributeValueDto } from '../dto/create-attribute_value.dto';
import { AttributeValueQueryDto } from '../dto/query-attribute_value.dto';
import { UpdateAttributeValueDto } from '../dto/update-attribute_value.dto';

@Controller('attribute-value')
export class AttributeValueController {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  @RequireResource('attribute_value', 'create')
  @Post()
  async create(@Body() createAttributeValueDto: CreateAttributeValueDto) {
    return this.attributeValueService.create(createAttributeValueDto);
  }

  @RequirePermissions('read:attribute_value', 'list:attribute_value')
  @Get()
  async findAll(@Query() query: AttributeValueQueryDto) {
    return this.attributeValueService.findAll(query);
  }

  @Public()
  @Get('all')
  async findAllWithoutPagination() {
    return this.attributeValueService.findAllWithoutPagination();
  }

  @RequireResource('attribute_value', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributeValueService.findOne(id);
  }

  @RequireResource('attribute_value', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto,
  ) {
    return this.attributeValueService.update(id, updateAttributeValueDto);
  }

  @RequireResource('attribute_value', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributeValueService.remove(id);
  }

  @RequireResource('attribute_value', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.attributeValueService.restore(id);
  }

  // Utility endpoints
  @Public()
  @Get('attribute/:attributeId')
  async findByAttribute(
    @Param('attributeId', ParseIntPipe) attributeId: number,
  ) {
    return this.attributeValueService.findByAttribute(attributeId);
  }

  @RequireResource('attribute_value', 'create')
  @Post('bulk/:attributeId')
  async bulkCreateForAttribute(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Body('values') values: string[],
  ) {
    return this.attributeValueService.bulkCreateForAttribute(
      attributeId,
      values,
    );
  }

  @RequirePermissions('read:attribute_value')
  @Get('stats/count')
  async getAttributeValuesCount() {
    const result = await this.attributeValueService.getAttributeValuesCount();
    return { count: result };
  }
}
