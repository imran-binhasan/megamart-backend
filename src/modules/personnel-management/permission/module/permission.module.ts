import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entity/permission.entity';
import { Role } from '../../role/entity/role.entity';
import { PermissionService } from '../service/permission.service';
import { PermissionController } from '../controller/permission.controller';
import { AuthModule } from 'src/core/auth/module/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role]), AuthModule],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
