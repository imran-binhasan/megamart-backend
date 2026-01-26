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
import { AddressQueryDto } from '../dto/query-address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @RequireResource('address', 'create')
  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    const result = await this.addressService.create(createAddressDto);
    return {
      success: true,
      message: 'Address created successfully',
      data: result,
    };
  }

  @RequireResource('address', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.addressService.findOne(id);
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
  ) {
    const result = await this.addressService.update(id, updateAddressDto);
    return {
      success: true,
      message: 'Address updated successfully',
      data: result,
    };
  }

  @RequireResource('address', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.addressService.remove(id);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }

  @RequireResource('address', 'read')
  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.addressService.findByUserId(userId);
    return {
      success: true,
      message: 'User addresses retrieved successfully',
      data: result,
    };
  }
}
