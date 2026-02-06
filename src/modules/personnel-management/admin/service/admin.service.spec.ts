import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Admin } from '../entity/admin.entity';
import { User } from '../../user/entity/user.entity';
import { Role } from '../../role/entity/role.entity';
import { CloudinaryService } from 'src/core/upload/service/cloudinary.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: jest.Mocked<any>;
  let userRepository: jest.Mocked<any>;
  let roleRepository: jest.Mocked<any>;

  const mockAdmin = {
    id: 1,
    userId: 1,
    department: 'Engineering',
    employeeNumber: 'EMP-001',
    roleId: 1,
    role: { id: 1, name: 'SUPER_ADMIN', permissions: [] },
    user: {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+8801712345678',
      image: null,
      lastLoginAt: null,
      deletedAt: null,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockRepos = {
    admin: {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findOne: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    },
    role: {
      findOne: jest.fn(),
    },
    cloudinary: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: mockRepos.admin },
        { provide: getRepositoryToken(User), useValue: mockRepos.user },
        { provide: getRepositoryToken(Role), useValue: mockRepos.role },
        { provide: CloudinaryService, useValue: mockRepos.cloudinary },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get(getRepositoryToken(Admin));
    userRepository = module.get(getRepositoryToken(User));
    roleRepository = module.get(getRepositoryToken(Role));
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return admin profile', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);

      const result = await service.getProfile(1);

      expect(result).toHaveProperty('email', 'admin@example.com');
      expect(result).toHaveProperty('firstName', 'Admin');
      expect(result).toHaveProperty('lastName', 'User');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepos.admin.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update admin profile', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.user.save.mockResolvedValue(mockAdmin.user);
      mockRepos.admin.save.mockResolvedValue(mockAdmin);

      const result = await service.updateProfile(1, { firstName: 'Updated' });

      expect(result).toBeDefined();
      expect(mockRepos.user.save).toHaveBeenCalled();
      expect(mockRepos.admin.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated admins', async () => {
      const qbMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockAdmin], 1]),
      };
      mockRepos.admin.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should search admins by name or email', async () => {
      const qbMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockAdmin], 1]),
      };
      mockRepos.admin.createQueryBuilder.mockReturnValue(qbMock);

      await service.findAll({ search: 'admin' });

      expect(qbMock.where).toHaveBeenCalled();
    });
  });

  describe('findAdminById', () => {
    it('should return admin by id', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);

      const result = await service.findAdminById(1);

      expect(result).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepos.admin.findOne.mockResolvedValue(null);

      await expect(service.findAdminById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAdmin', () => {
    it('should update admin fields', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.user.save.mockResolvedValue(mockAdmin.user);
      mockRepos.admin.save.mockResolvedValue(mockAdmin);

      const result = await service.updateAdmin(1, { department: 'New Dept' });

      expect(result).toBeDefined();
    });
  });

  describe('removeAdmin / restoreAdmin', () => {
    it('should soft delete admin and user', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.admin.softDelete.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      mockRepos.user.softDelete.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await service.removeAdmin(1);

      expect(mockRepos.admin.softDelete).toHaveBeenCalledWith(1);
      expect(mockRepos.user.softDelete).toHaveBeenCalledWith(1);
    });

    it('should restore soft-deleted admin', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.admin.restore.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const result = await service.restoreAdmin(1);

      expect(result).toBeDefined();
      expect(mockRepos.admin.restore).toHaveBeenCalledWith(1);
    });
  });

  describe('changeRole', () => {
    it('should change admin role', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.role.findOne.mockResolvedValue({ id: 2, name: 'MODERATOR' });
      mockRepos.admin.save.mockResolvedValue({ ...mockAdmin, roleId: 2 });

      const result = await service.changeRole(1, 2);

      expect(result).toBeDefined();
      expect(mockRepos.admin.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      mockRepos.admin.findOne.mockResolvedValue(mockAdmin);
      mockRepos.role.findOne.mockResolvedValue(null);

      await expect(service.changeRole(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAdminStats', () => {
    it('should return admin stats', async () => {
      mockRepos.admin.count.mockResolvedValue(10);
      const qbMock = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { department: 'Engineering', count: '5' },
          { department: 'Support', count: '3' },
        ]),
      };
      mockRepos.admin.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.getAdminStats();

      expect(result.total).toBe(10);
      expect(result.byDepartment.Engineering).toBe(5);
      expect(result.byDepartment.Support).toBe(3);
    });
  });
});
