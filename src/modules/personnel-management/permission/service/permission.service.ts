import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entity/permission.entity';
import { Role } from 'src/modules/personnel-management/role/entity/role.entity';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getUserPermissions(roleId: number): Promise<string[]> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions'],
      });

      if (!role) {
        this.logger.warn(`Role not found: ${roleId}`);
        return [];
      }

      const permissions = role.permissions.map(
        (permission) => `${permission.action}:${permission.resource}`,
      );

      this.logger.debug(
        `Retrieved ${permissions.length} permissions for role ${roleId}: ${permissions.join(', ')}`,
      );

      return permissions;
    } catch (error) {
      this.logger.error(`Failed to get permissions for role ${roleId}:`, error);
      return [];
    }
  }

  async createPermission(
    resource: string,
    action: string,
    displayName?: string,
    scope?: 'all' | 'own' | 'department' | 'assigned',
  ): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { resource, action },
    });
    if (existing) {
      throw new ConflictException(
        `Permission ${action}:${resource} already exists`,
      );
    }

    const permission = this.permissionRepository.create({
      resource,
      action,
      displayName: displayName || `${action}:${resource}`,
      scope: scope || 'own',
    });
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findById(id);
    Object.assign(permission, dto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionRepository.remove(permission);
    this.logger.log(`Deleted permission: ${id}`);
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { resource, action },
    });
  }

  async deletePermission(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  validatePermissionFormat(permission: string): boolean {
    const parts = permission.split(':');
    return (
      parts.length === 2 && parts[0].trim() !== '' && parts[1].trim() !== ''
    );
  }

  async getUniqueResources(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.resource', 'resource')
      .getRawMany();

    return result.map((r) => r.resource);
  }

  async getUniqueActions(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.action', 'action')
      .getRawMany();

    return result.map((r) => r.action);
  }
}
