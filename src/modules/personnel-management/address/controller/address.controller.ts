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
import { AddressService } from '../service/address.service';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { RequireResource } from 'src/core/auth/decorator/auth.decorator';
import { CurrentUser } from 'src/core/auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from 'src/core/auth/interface/auth-user.interface';
import { AddressQueryDto } from '../dto/query-address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @RequireResource('address', 'create')
  @Post()
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.addressService.create(
      createAddressDto,
      user.id,
    );
    return {
      success: true,
      message: 'Address created successfully',
      data: result,
    };
  }

  @RequireResource('address', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.addressService.findOne(id, user.id);
    return {
      success: true,
      message: 'Address retrieved successfully',
      data: result,
    };
  }

  @RequireResource('address', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.addressService.update(
      id,
      updateAddressDto,
      user.id,
      user,
    );
    return {
      success: true,
      message: 'Address updated successfully',
      data: result,
    };
  }

  @RequireResource('address', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.addressService.remove(id, user.id, user);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }

  @RequireResource('address', 'read')
  @Get()
  async findByUserId(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.addressService.findByUserId(user.id);
    return {
      success: true,
      message: 'User addresses retrieved successfully',
      data: result,
    };
  }
}
