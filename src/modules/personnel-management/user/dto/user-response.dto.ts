import { UserType } from '../entity/user.entity';

export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  image?: string;
  userType: UserType;
  emailVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
