import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from '../entity/vendor.entity';
import { VendorAuthController } from '../controller/vendor-auth.controller';
import { VendorProfileController } from '../controller/vendor-profile.controller';
import { VendorController } from '../controller/vendor.controller';
import { VendorAuthService } from '../service/vendor-auth.service';
import { VendorService } from '../service/vendor.service';
import { AuthModule } from 'src/core/auth/module/auth.module';
import { User } from '../../user/entity/user.entity';
import { CloudinaryService } from 'src/core/upload/service/cloudinary.service';
import { VendorBankInfo } from '../entity/vendor-bank-info.entity';
import { VendorKYC } from '../entity/vendor-kyc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, VendorBankInfo, VendorKYC, User]),
    AuthModule,
  ],
  controllers: [
    VendorAuthController,
    VendorProfileController,
    VendorController,
  ],
  providers: [VendorAuthService, VendorService, CloudinaryService],
  exports: [VendorAuthService, VendorService],
})
export class VendorModule {}
