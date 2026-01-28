// src/attribute_value/dto/create-attribute-value.dto.ts
import { IsString, IsNotEmpty, IsNumber, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeValueDto {
  @ApiProperty({
    description: 'Attribute value',
    type: String,
    minLength: 1,
    maxLength: 255,
    example: 'Red',
  })
  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value is required' })
  @Length(1, 255, { message: 'Value must be between 1 and 255 characters' })
  @Transform(({ value }) => value?.trim())
  value: string;

  @ApiProperty({
    description: 'Attribute ID',
    type: Number,
    example: 1,
  })
  @IsNotEmpty({ message: 'Attribute ID is required' })
  @IsNumber()
  attributeId: number;
}
