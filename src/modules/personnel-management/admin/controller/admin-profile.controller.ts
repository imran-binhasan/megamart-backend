import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from '../service/admin.service';
import { CurrentUser } from 'src/core/auth/decorator/current-user.decorator';
import { AdminGuard } from 'src/core/auth/guard/admin.guard';
import { AdminProfileDto } from '../dto/admin-profile.dto';
import type { AuthenticatedUser } from 'src/core/auth/interface/auth-user.interface';

@ApiTags('Admin - Profile')
@Controller({ path: 'admin/profile', version: '1' })
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminProfileController {
  constructor(private adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access only' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdminProfileDto> {
    return this.adminService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin profile updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access only' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Partial<AdminProfileDto>,
  ): Promise<AdminProfileDto> {
    return this.adminService.updateProfile(user.id, dto);
  }
}
