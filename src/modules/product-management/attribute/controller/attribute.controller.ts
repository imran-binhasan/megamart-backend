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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AttributeService } from '../service/attribute.service';
import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { AttributeQueryDto } from '../dto/query-attribute.dto';

/**
 * Attribute Controller - Optimized with 5 core endpoints + query support
 * 
 * Endpoints:
 * 1. POST /attribute - Create attribute
 * 2. GET /attribute - List attributes with advanced query filters
 * 3. GET /attribute/:id - Get single attribute
 * 4. PATCH /attribute/:id - Update attribute
 * 5. DELETE /attribute/:id - Delete attribute
 * 
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by name)
 * - type (attribute type)
 * - includeValues (boolean) - include attribute values
 * - includeDeleted (boolean) - include soft-deleted
 */
@ApiTags('Product Management - Attributes')
@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  /**
   * Create a new attribute
   * @param createAttributeDto Attribute data
   */
  @ApiOperation({
    summary: 'Create a new attribute',
    description: 'Create a new product attribute (e.g., Size, Color, Brand)',
  })
  @ApiResponse({
    status: 201,
    description: 'Attribute created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Size',
        type: 'SELECT',
        values: [],
        createdAt: '2026-01-28T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  @RequireResource('attribute', 'create')
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  /**
   * Get attributes with advanced filtering and query support
   */
  @ApiOperation({
    summary: 'Get all attributes with advanced filtering',
    description:
      'Retrieve attributes with pagination and filtering by type and values',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attributes',
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
    description: 'Search by attribute name (case-insensitive)',
    example: 'size',
  })
  @ApiQuery({
    name: 'type',
    enum: ['SELECT', 'TEXT', 'BOOLEAN', 'NUMBER'],
    required: false,
    description: 'Filter by attribute type',
    example: 'SELECT',
  })
  @ApiQuery({
    name: 'includeValues',
    type: Boolean,
    required: false,
    description: 'Include attribute values in response',
    example: false,
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: Boolean,
    required: false,
    description: 'Include soft-deleted attributes',
    example: false,
  })
  @Public()
  @Get()
  async findAll(@Query() query: AttributeQueryDto) {
    return this.attributeService.findAll(query);
  }

  /**
   * Get single attribute by ID
   * @param id Attribute ID
   */
  @ApiOperation({
    summary: 'Get a single attribute',
    description: 'Retrieve a specific attribute with all its values',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Attribute found',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute not found',
  })
  @RequireResource('attribute', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.findOne(id);
  }

  /**
   * Update attribute
   * @param id Attribute ID
   * @param updateAttributeDto Updated attribute data
   */
  @ApiOperation({
    summary: 'Update an attribute',
    description: 'Update attribute name and/or type',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Attribute updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute not found',
  })
  @ApiBearerAuth()
  @RequireResource('attribute', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributeService.update(id, updateAttributeDto);
  }

  /**
   * Delete attribute (soft delete)
   * @param id Attribute ID
   */
  @ApiOperation({
    summary: 'Delete an attribute',
    description: 'Soft delete an attribute',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Attribute deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute not found',
  })
  @ApiBearerAuth()
  @RequireResource('attribute', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.remove(id);
  }
}
