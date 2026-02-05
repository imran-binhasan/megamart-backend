import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserType } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginatedServiceResponse } from 'src/shared/interface/api-response.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({
      where: [{ email: dto.email }],
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    this.logger.log(`Created user: ${saved.email} (${saved.userType})`);
    return this.toResponseDto(saved);
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<PaginatedServiceResponse<UserResponseDto>> {
    const { page = 1, limit = 10, userType, search } = query;
    const where: any = {};

    if (userType) where.userType = userType;
    if (search) {
      where.OR = [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ];
    }

    const [items, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: items.map((u) => this.toResponseDto(u)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.password) {
      dto.password = await argon2.hash(dto.password);
    }

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    this.logger.log(`Updated user: ${saved.id}`);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.softDelete(id);
    this.logger.log(`Deleted user: ${id}`);
  }

  async restore(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (!user.deletedAt) {
      throw new ConflictException('User is not deleted');
    }
    await this.userRepository.restore(id);
    return this.toResponseDto(user);
  }

  async lockAccount(id: number, until: Date): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.accountLockedUntil = until;
    const saved = await this.userRepository.save(user);
    return this.toResponseDto(saved);
  }

  async unlockAccount(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.accountLockedUntil = undefined;
    user.failedLoginAttempts = 0;
    const saved = await this.userRepository.save(user);
    return this.toResponseDto(saved);
  }

  async getStats(): Promise<{ total: number; byType: Record<string, number> }> {
    const total = await this.userRepository.count();
    const customers = await this.userRepository.count({
      where: { userType: UserType.CUSTOMER },
    });
    const vendors = await this.userRepository.count({
      where: { userType: UserType.VENDOR },
    });
    const admins = await this.userRepository.count({
      where: { userType: UserType.ADMIN },
    });

    return {
      total,
      byType: { customer: customers, vendor: vendors, admin: admins },
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      image: user.image,
      userType: user.userType,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      failedLoginAttempts: user.failedLoginAttempts,
      accountLockedUntil: user.accountLockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
