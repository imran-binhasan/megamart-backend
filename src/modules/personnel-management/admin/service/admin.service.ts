import * as argon2 from 'argon2';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../entity/admin.entity';
import { User } from '../../user/entity/user.entity';
import { Role } from '../../role/entity/role.entity';
import { Repository, Like } from 'typeorm';
import { CloudinaryService } from 'src/core/upload/service/cloudinary.service';
import { AdminProfileDto } from '../dto/admin-profile.dto';
import { PaginatedServiceResponse } from 'src/shared/interface/api-response.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getProfile(userId: number): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { userId },
      relations: ['user', 'role', 'role.permissions'],
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return {
      id: admin.id,
      email: admin.user.email,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      phone: admin.user.phone,
      role: {
        id: admin.role.id,
        name: admin.role.name,
        permissions: admin.role.permissions.map((p) => p.displayName),
      },
      department: admin.department,
      employeeNumber: admin.employeeNumber,
      image: admin.user.image,
      lastLoginAt: admin.user.lastLoginAt,
      joinedAt: admin.createdAt,
    };
  }

  async updateProfile(
    userId: number,
    dto: Partial<AdminProfileDto>,
  ): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { userId },
      relations: ['user', 'role', 'role.permissions'],
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    if (dto.firstName) admin.user.firstName = dto.firstName;
    if (dto.lastName) admin.user.lastName = dto.lastName;
    if (dto.phone) admin.user.phone = dto.phone;
    if (dto.department) admin.department = dto.department;
    if (dto.employeeNumber) admin.employeeNumber = dto.employeeNumber;

    await this.userRepository.save(admin.user);
    await this.adminRepository.save(admin);

    return this.getProfile(userId);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedServiceResponse<AdminProfileDto>> {
    const { page = 1, limit = 10, search } = query;

    const qb = this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .leftJoinAndSelect('admin.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions');

    if (search) {
      qb.where(
        'user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('admin.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((admin) => ({
        id: admin.id,
        email: admin.user.email,
        firstName: admin.user.firstName,
        lastName: admin.user.lastName,
        phone: admin.user.phone,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          permissions: admin.role.permissions.map((p) => p.displayName),
        },
        department: admin.department,
        employeeNumber: admin.employeeNumber,
        image: admin.user.image,
        lastLoginAt: admin.user.lastLoginAt,
        joinedAt: admin.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAdminById(id: number): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['user', 'role', 'role.permissions'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return {
      id: admin.id,
      email: admin.user.email,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      phone: admin.user.phone,
      role: {
        id: admin.role.id,
        name: admin.role.name,
        permissions: admin.role.permissions.map((p) => p.displayName),
      },
      department: admin.department,
      employeeNumber: admin.employeeNumber,
      image: admin.user.image,
      lastLoginAt: admin.user.lastLoginAt,
      joinedAt: admin.createdAt,
    };
  }

  async updateAdmin(
    id: number,
    dto: Record<string, any>,
  ): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['user', 'role', 'role.permissions'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (dto.firstName) admin.user.firstName = dto.firstName;
    if (dto.lastName) admin.user.lastName = dto.lastName;
    if (dto.phone) admin.user.phone = dto.phone;
    if (dto.department) admin.department = dto.department;
    if (dto.employeeNumber) admin.employeeNumber = dto.employeeNumber;

    await this.userRepository.save(admin.user);
    await this.adminRepository.save(admin);

    return this.findAdminById(id);
  }

  async removeAdmin(id: number): Promise<void> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    await this.adminRepository.softDelete(id);
    await this.userRepository.softDelete(admin.user.id);
  }

  async restoreAdmin(id: number): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    await this.adminRepository.restore(id);
    if (admin.user.deletedAt) {
      await this.userRepository.restore(admin.user.id);
    }

    return this.findAdminById(id);
  }

  async changeRole(adminId: number, roleId: number): Promise<AdminProfileDto> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    admin.roleId = roleId;
    await this.adminRepository.save(admin);

    return this.findAdminById(adminId);
  }

  async getAdminStats(): Promise<{
    total: number;
    byDepartment: Record<string, number>;
  }> {
    const total = await this.adminRepository.count();

    const departments = await this.adminRepository
      .createQueryBuilder('admin')
      .select('admin.department', 'department')
      .addSelect('COUNT(admin.id)', 'count')
      .groupBy('admin.department')
      .getRawMany();

    const byDepartment: Record<string, number> = {};
    for (const d of departments) {
      byDepartment[d.department || 'Unassigned'] = parseInt(d.count, 10);
    }

    return { total, byDepartment };
  }
}
