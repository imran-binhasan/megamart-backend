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

import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { AttributeValueService } from '../service/attribute_value.service';
import { CreateAttributeValueDto } from '../dto/create-attribute_value.dto';
import { AttributeValueQueryDto } from '../dto/query-attribute_value.dto';
import { UpdateAttributeValueDto } from '../dto/update-attribute_value.dto';

/**
 * Attribute Value Controller - Optimized with 5 core endpoints + query support
 *
 * Endpoints:
 * 1. POST /attribute-value - Create attribute value
 * 2. GET /attribute-value - List attribute values with advanced query filters
 * 3. GET /attribute-value/:id - Get single attribute value
 * 4. PATCH /attribute-value/:id - Update attribute value
 * 5. DELETE /attribute-value/:id - Delete attribute value
 *
 * Query Parameters Support:
 * - page, limit (pagination)
 * - search (by value)
 * - attributeId (filter by attribute)
 * - includeDeleted (boolean) - include soft-deleted
 */
@ApiTags('Product Management - Attribute Values')
@Controller('attribute-value')
export class AttributeValueController {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  /**
   * Create a new attribute value
   * @param createAttributeValueDto Attribute value data
   */
  @ApiOperation({
    summary: 'Create a new attribute value',
    description: 'Create a new value for a product attribute',
  })
  @ApiResponse({
    status: 201,
    description: 'Attribute value created successfully',
    schema: {
      example: {
        id: 1,
        value: 'Red',
        attributeId: 1,
        createdAt: '2026-01-28T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBearerAuth()
  @RequireResource('attribute_value', 'create')
  @Post()
  async create(@Body() createAttributeValueDto: CreateAttributeValueDto) {
    return this.attributeValueService.create(createAttributeValueDto);
  }

  /**
   * Get attribute values with advanced filtering and query support
   */
  @ApiOperation({
    summary: 'Get all attribute values with advanced filtering',
    description:
      'Retrieve attribute values with pagination and filtering by attribute',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attribute values',
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
    description: 'Search by attribute value (case-insensitive)',
    example: 'red',
  })
  @ApiQuery({
    name: 'attributeId',
    type: Number,
    required: false,
    description: 'Filter by attribute ID',
    example: 1,
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: Boolean,
    required: false,
    description: 'Include soft-deleted attribute values',
    example: false,
  })
  @Public()
  @Get()
  async findAll(@Query() query: AttributeValueQueryDto) {
    return this.attributeValueService.findAll(query);
  }

  /**
   * Get single attribute value by ID
   * @param id Attribute value ID
   */
  @ApiOperation({
    summary: 'Get a single attribute value',
    description: 'Retrieve a specific attribute value',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute value ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Attribute value found',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute value not found',
  })
  @RequireResource('attribute_value', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributeValueService.findOne(id);
  }

  /**
   * Update attribute value
   * @param id Attribute value ID
   * @param updateAttributeValueDto Updated attribute value data
   */
  @ApiOperation({
    summary: 'Update an attribute value',
    description: 'Update attribute value content',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute value ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Attribute value updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute value not found',
  })
  @ApiBearerAuth()
  @RequireResource('attribute_value', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto,
  ) {
    return this.attributeValueService.update(id, updateAttributeValueDto);
  }

  /**
   * Delete attribute value (soft delete)
   * @param id Attribute value ID
   */
  @ApiOperation({
    summary: 'Delete an attribute value',
    description: 'Soft delete an attribute value',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Attribute value ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Attribute value deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attribute value not found',
  })
  @ApiBearerAuth()
  @RequireResource('attribute_value', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributeValueService.remove(id);
  }
}
