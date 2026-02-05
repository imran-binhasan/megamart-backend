import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User, UserType } from '../entity/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    emailVerified: false,
    password: 'hashed-password',
    phone: '+8801712345678',
    image: null,
    userType: UserType.CUSTOMER,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    accountLockedUntil: null,
    customer: null,
    admin: null,
    vendor: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+8801712345678',
      userType: UserType.CUSTOMER as UserType,
    };

    it('should create a user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(mockUserRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: [{ email: createDto.email }] }),
      );
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by userType', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({
        page: 1,
        limit: 10,
        userType: UserType.CUSTOMER,
      });

      expect(mockUserRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userType: UserType.CUSTOMER },
        }),
      );
    });

    it('should search by name or email', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({ page: 1, limit: 10, search: 'john' });

      expect(mockUserRepo.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user entity by email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({ ...mockUser, firstName: 'Jane' });

      const result = await service.update(1, { firstName: 'Jane' });

      expect(result).toHaveProperty('firstName', 'Jane');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { firstName: 'Jane' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if email already taken', async () => {
      mockUserRepo.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, id: 2 });

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.softDelete.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await service.remove(1);

      expect(mockUserRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted user', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });
      mockUserRepo.restore.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const result = await service.restore(1);

      expect(result).toHaveProperty('id', 1);
      expect(mockUserRepo.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is not deleted', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.restore(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('lockAccount / unlockAccount', () => {
    it('should lock user account', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const until = new Date('2025-01-01');
      mockUserRepo.save.mockResolvedValue({
        ...mockUser,
        accountLockedUntil: until,
      });

      const result = await service.lockAccount(1, until);

      expect(result).toHaveProperty('accountLockedUntil', until);
    });

    it('should unlock user account', async () => {
      const lockedUser = {
        ...mockUser,
        accountLockedUntil: new Date('2025-01-01'),
      };
      mockUserRepo.findOne.mockResolvedValue(lockedUser);
      mockUserRepo.save.mockImplementation(async (u: any) => u);

      const result = await service.unlockAccount(1);

      expect(result.failedLoginAttempts).toBe(0);
      expect(result.failedLoginAttempts).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      mockUserRepo.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(10);

      const result = await service.getStats();

      expect(result.total).toBe(100);
      expect(result.byType.customer).toBe(60);
      expect(result.byType.vendor).toBe(30);
      expect(result.byType.admin).toBe(10);
    });
  });
});
