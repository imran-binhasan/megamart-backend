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
    return this.addressService.create(createAddressDto, user.id);
  }

  @RequireResource('address', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressService.findOne(id, user.id);
  }

  @RequireResource('address', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressService.update(id, updateAddressDto, user.id, user);
  }

  @RequireResource('address', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addressService.remove(id, user.id, user);
  }

  @RequireResource('address', 'read')
  @Get()
  async findByUserId(@CurrentUser() user: AuthenticatedUser) {
    return this.addressService.findByUserId(user.id);
  }
}
