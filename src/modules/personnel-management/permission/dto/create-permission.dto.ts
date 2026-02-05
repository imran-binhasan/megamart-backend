import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Resource name (e.g. product, order, user)',
    example: 'product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resource: string;

  @ApiProperty({
    description: 'Action (e.g. create, read, update, delete, manage)',
    example: 'manage',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiPropertyOptional({
    description: 'Scope of permission',
    enum: ['all', 'own', 'department', 'assigned'],
    default: 'own',
  })
  @IsOptional()
  @IsEnum(['all', 'own', 'department', 'assigned'])
  scope?: 'all' | 'own' | 'department' | 'assigned' = 'own';

  @ApiProperty({
    description: 'Human-readable display name',
    example: 'Manage Products',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  displayName: string;
}
