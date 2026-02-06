import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from '../entity/vendor.entity';
import { User } from '../../user/entity/user.entity';
import { VendorProfileDto } from '../dto/vendor-profile.dto';
import { PaginatedServiceResponse } from 'src/shared/interface/api-response.interface';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedServiceResponse<Vendor>> {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.vendorRepository
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.user', 'user');

    if (search?.trim()) {
      qb.andWhere(
        '(vendor.shopName ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (status) {
      qb.andWhere('vendor.status = :status', { status });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('vendor.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['user', 'kyc', 'bankInfo'],
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async approveVendor(id: number): Promise<Vendor> {
    const vendor = await this.findById(id);
    if (vendor.status !== VendorStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(`Vendor is already ${vendor.status}`);
    }
    vendor.status = VendorStatus.ACTIVE;
    vendor.approvedAt = new Date();
    return this.vendorRepository.save(vendor);
  }

  async suspendVendor(id: number): Promise<Vendor> {
    const vendor = await this.findById(id);
    if (vendor.status === VendorStatus.SUSPENDED) {
      throw new BadRequestException('Vendor is already suspended');
    }
    if (vendor.status === VendorStatus.BANNED) {
      throw new BadRequestException('Cannot suspend a banned vendor');
    }
    vendor.status = VendorStatus.SUSPENDED;
    return this.vendorRepository.save(vendor);
  }

  async rejectVendor(id: number): Promise<Vendor> {
    const vendor = await this.findById(id);
    if (vendor.status !== VendorStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(`Vendor is already ${vendor.status}`);
    }
    vendor.status = VendorStatus.BANNED;
    vendor.rejectedAt = new Date();
    vendor.rejectionReason = 'Rejected by admin';
    return this.vendorRepository.save(vendor);
  }

  async getProfile(userId: number): Promise<VendorProfileDto> {
    const vendor = await this.vendorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    return {
      id: vendor.id,
      email: vendor.user.email,
      firstName: vendor.user.firstName,
      lastName: vendor.user.lastName,
      phone: vendor.user.phone,
      shopName: vendor.shopName,
      shopSlug: vendor.shopSlug,
      shopDescription: vendor.shopDescription,
      businessEmail: vendor.businessEmail,
      businessPhone: vendor.businessPhone,
      image: vendor.user.image,
      status: vendor.status,
      ratings: {
        averageRating: vendor.averageRating || 0,
        totalReviews: vendor.totalReviews,
      },
      joinedAt: vendor.createdAt,
    };
  }

  async updateProfile(
    userId: number,
    dto: Partial<VendorProfileDto>,
  ): Promise<VendorProfileDto> {
    const vendor = await this.vendorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    // Update user fields
    if (dto.firstName) vendor.user.firstName = dto.firstName;
    if (dto.lastName) vendor.user.lastName = dto.lastName;
    if (dto.phone) vendor.user.phone = dto.phone;

    // Update vendor fields
    if (dto.shopDescription) vendor.shopDescription = dto.shopDescription;
    if (dto.businessEmail) vendor.businessEmail = dto.businessEmail;
    if (dto.businessPhone) vendor.businessPhone = dto.businessPhone;

    await this.userRepository.save(vendor.user);
    await this.vendorRepository.save(vendor);

    return this.getProfile(userId);
  }
}
