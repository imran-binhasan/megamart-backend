import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorService } from '../service/vendor.service';
import { AdminOnly } from 'src/core/auth/decorator/auth.decorator';
import { PaginationQuery } from 'src/shared/dto/pagination_query.dto';

@ApiTags('Admin - Vendor Management')
@Controller('vendor')
@AdminOnly()
@ApiBearerAuth()
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @ApiOperation({
    summary: 'List all vendors',
    description: 'Admin only. Paginated vendor list with search.',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Vendor list retrieved' })
  @Get()
  async findAll(@Query() query: PaginationQuery & { status?: string }) {
    return this.vendorService.findAll(query);
  }

  @ApiOperation({ summary: 'Get vendor by ID', description: 'Admin only.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vendor found' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.findById(id);
  }

  @ApiOperation({
    summary: 'Approve vendor',
    description: 'Approve a pending vendor. Admin only.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vendor approved' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @Patch(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.approveVendor(id);
  }

  @ApiOperation({
    summary: 'Suspend vendor',
    description: 'Suspend a vendor. Admin only.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vendor suspended' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @Patch(':id/suspend')
  async suspend(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.suspendVendor(id);
  }

  @ApiOperation({
    summary: 'Reject vendor',
    description: 'Reject a vendor application. Admin only.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Vendor rejected' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @Patch(':id/reject')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.rejectVendor(id);
  }
}
