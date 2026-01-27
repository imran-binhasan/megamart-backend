import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { AddressType, AddressOwnerType } from '../entity/address.entity';

export class CreateAddressDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsEnum(AddressOwnerType)
  @IsNotEmpty()
  ownerType: AddressOwnerType;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
