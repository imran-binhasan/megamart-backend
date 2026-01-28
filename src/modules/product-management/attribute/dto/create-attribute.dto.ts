// src/attribute/dto/create-attribute.dto.ts
import { IsString, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeType } from '../entity/attribute.entity';

export class CreateAttributeDto {
  @ApiProperty({
    description: 'Attribute name',
    type: String,
    minLength: 2,
    maxLength: 255,
    example: 'Size',
  })
  @IsString({ message: 'Attribute name must be a string' })
  @IsNotEmpty({ message: 'Attribute name is required' })
  @Length(2, 255, {
    message: 'Attribute name must be between 2 and 255 characters',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Attribute type',
    enum: AttributeType,
    example: 'SELECT',
  })
  @IsEnum(AttributeType, {
    message: `Type must be one of: ${Object.values(AttributeType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Attribute type is required' })
  type: AttributeType;
}
