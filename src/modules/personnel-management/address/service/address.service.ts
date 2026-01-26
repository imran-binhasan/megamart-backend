import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address, AddressOwnerType } from '../entity/address.entity';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { Customer } from '../../customer/entity/customer.entity';
import { Vendor } from '../../vendor/entity/vendor.entity';
import { CreateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { userId, ownerType, isDefault, ...restData } = createAddressDto;

    // Validate that userId is provided
    if (!userId) {
      throw new BadRequestException('userId must be provided');
    }

    // Validate that ownerType is provided
    if (!ownerType) {
      throw new BadRequestException('ownerType must be provided');
    }

    // Validate owner exists (customer or vendor)
    if (ownerType === AddressOwnerType.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with userId ${userId} not found`);
      }
    } else if (ownerType === AddressOwnerType.VENDOR) {
      const vendor = await this.vendorRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!vendor) {
        throw new NotFoundException(`Vendor with userId ${userId} not found`);
      }
    }

    // If this is going to be the default address, unset other defaults
    if (isDefault) {
      await this.unsetDefaultAddresses(ownerType, userId);
    }

    // Create address
    const addressPayload: Partial<Address> = {
      ...restData,
      ownerType,
      userId,
      isDefault: isDefault || false,
    };

    const address = this.addressRepository.create(addressPayload);
    const savedAddress = await this.addressRepository.save(address);
    return this.findOne(savedAddress.id);
  }



  async findOne(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async findByCustomer(customerId: number): Promise<Address[]> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return this.addressRepository.find({
      where: {
        ownerType: AddressOwnerType.CUSTOMER,
        userId: customer.userId,
      },
      relations: ['user'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const existingAddress = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingAddress) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // If setting as default, unset other defaults for the same owner
    if (updateAddressDto.isDefault) {
      await this.unsetDefaultAddresses(
        existingAddress.ownerType,
        existingAddress.userId,
      );
    }

    // Update address
    await this.addressRepository.update(id, updateAddressDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    await this.addressRepository.remove(address);
  }

  private async unsetDefaultAddresses(
    ownerType: AddressOwnerType,
    userId: number,
  ): Promise<void> {
    await this.addressRepository.update(
      { ownerType, userId },
      { isDefault: false },
    );
  }
}