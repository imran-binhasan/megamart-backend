import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorService } from '../service/vendor.service';
import { CurrentUser } from 'src/core/auth/decorator/current-user.decorator';
import { VendorGuard } from 'src/core/auth/guard/vendor.guard';
import { VendorProfileDto } from '../dto/vendor-profile.dto';
import type { AuthenticatedUser } from 'src/core/auth/interface/auth-user.interface';

@ApiTags('Vendor - Profile')
@Controller({ path: 'vendor/profile', version: '1' })
@UseGuards(VendorGuard)
@ApiBearerAuth()
export class VendorProfileController {
  constructor(private vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'Get vendor profile' })
  @ApiResponse({
    status: 200,
    description: 'Vendor profile retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Vendor access only' })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorProfileDto> {
    return this.vendorService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update vendor profile' })
  @ApiResponse({
    status: 200,
    description: 'Vendor profile updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Vendor access only' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Partial<VendorProfileDto>,
  ): Promise<VendorProfileDto> {
    return this.vendorService.updateProfile(user.id, dto);
  }
}
