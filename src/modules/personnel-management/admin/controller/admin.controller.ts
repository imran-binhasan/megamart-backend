import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from '../service/admin.service';
import { AdminOnly } from 'src/core/auth/decorator/auth.decorator';
import { AdminWithPermission } from 'src/core/auth/decorator/auth.decorator';
import { RequirePermission } from 'src/core/auth/decorator/permission.decorator';

@ApiTags('Admin - Management')
@Controller('admin')
@AdminOnly()
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all admin accounts' })
  @ApiResponse({ status: 200, description: 'Admin list' })
  async findAll(
    @Query() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Admin found' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findAdminById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin account' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Admin updated' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, any>,
  ) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an admin account' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Admin deleted' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeAdmin(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Admin restored' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.restoreAdmin(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change admin role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Role changed' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.adminService.changeRole(id, roleId);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get admin statistics' })
  @ApiResponse({ status: 200, description: 'Admin stats' })
  async getStats() {
    return this.adminService.getAdminStats();
  }
}
