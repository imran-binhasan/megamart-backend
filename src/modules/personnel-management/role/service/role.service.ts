import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entity/role.entity';
import { Permission } from '../../permission/entity/permission.entity';
import { PermissionCacheService } from 'src/core/auth/service/permission-cache.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PaginatedServiceResponse } from 'src/shared/interface/api-response.interface';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionCacheService: PermissionCacheService,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { name: dto.name.toUpperCase() },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Role ${dto.name} already exists`);
    }

    const role = this.roleRepository.create({
      ...dto,
      name: dto.name.toUpperCase(),
    });
    const saved = await this.roleRepository.save(role);
    this.logger.log(`Created role: ${saved.name}`);
    return saved;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedServiceResponse<Role>> {
    const { page = 1, limit = 10 } = query;
    const [items, total] = await this.roleRepository.findAndCount({
      relations: ['permissions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (dto.name && dto.name.toUpperCase() !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: dto.name.toUpperCase() },
      });
      if (existing) {
        throw new ConflictException(`Role ${dto.name} already exists`);
      }
    }
    const updateData = {
      ...dto,
      ...(dto.name && { name: dto.name.toUpperCase() }),
    };
    await this.roleRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    if (role.isSystemRole) {
      throw new ConflictException('Cannot delete a system role');
    }
    await this.roleRepository.softDelete(id);
    await this.permissionCacheService.invalidatePermissions(id);
    this.logger.log(`Deleted role ${id}`);
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findById(roleId);
    const permissions =
      await this.permissionRepository.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }
    role.permissions = permissions;
    const updated = await this.roleRepository.save(role);
    await this.permissionCacheService.invalidatePermissions(roleId);
    this.logger.log(
      `Assigned ${permissions.length} permissions to role ${roleId}`,
    );
    return updated;
  }

  async addPermission(roleId: number, permissionId: number): Promise<Role> {
    const role = await this.findById(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );
    }
    const hasPermission = role.permissions.some((p) => p.id === permissionId);
    if (hasPermission) {
      throw new ConflictException('Permission already assigned to role');
    }
    role.permissions.push(permission);
    const updated = await this.roleRepository.save(role);
    await this.permissionCacheService.invalidatePermissions(roleId);
    return updated;
  }

  async removePermission(roleId: number, permissionId: number): Promise<Role> {
    const role = await this.findById(roleId);
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    const updated = await this.roleRepository.save(role);
    await this.permissionCacheService.invalidatePermissions(roleId);
    return updated;
  }
}
