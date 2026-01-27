import { BaseEntity } from 'src/shared/entity/base.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Customer } from '../../customer/entity/customer.entity';
import { Vendor } from '../../vendor/entity/vendor.entity';
import { User } from '../../user/entity/user.entity';

export enum AddressOwnerType {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
}

export enum AddressType {
  // Customer address types
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both',
  // Vendor address types
  BUSINESS = 'business',
  WAREHOUSE = 'warehouse',
  PICKUP = 'pickup',
  REGISTERED = 'registered',
}

@Entity('address')
@Index(['ownerType', 'userId'])
@Index(['ownerType', 'type'])
export class Address extends BaseEntity {
  // Polymorphic field
  @Column({
    name: 'owner_type',
    type: 'enum',
    enum: AddressOwnerType,
  })
  ownerType: AddressOwnerType;

  // User reference (both customer and vendor have userId)
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  // Address fields
  @Column({ name: 'full_name', type: 'varchar', length: 200, nullable: true })
  fullName?: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address_line_1', type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({
    name: 'address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine2?: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20 })
  postalCode: string;

  @Column({ name: 'country', type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'country_code', type: 'varchar', length: 3, nullable: true })
  countryCode?: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: AddressType,
  })
  type: AddressType;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  // Relations (for eager loading when needed)
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
