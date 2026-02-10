import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from '../service/address.service';
import { AddressController } from '../controller/address.controller';
import { Address } from '../entity/address.entity';
import { AuthModule } from 'src/core/auth/module/auth.module';
import { Customer } from '../../customer/entity/customer.entity';
import { Vendor } from '../../vendor/entity/vendor.entity';
import { User } from '../../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, Customer, Vendor, User]),
    AuthModule,
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
