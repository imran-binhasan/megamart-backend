import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Unique role name', example: 'SUPER_ADMIN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Human-readable display name',
    example: 'Super Admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({ description: 'Description of the role' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a system role (prevents deletion)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;
}

export class AssignPermissionsDto {
  @ApiProperty({ description: 'Array of permission IDs to assign' })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}

export class RoleQueryDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page' })
  @IsOptional()
  limit?: number = 10;
}
