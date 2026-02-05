import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { Permission } from '../entity/permission.entity';
import { Role } from '../../role/entity/role.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepository: jest.Mocked<Repository<Permission>>;
  let roleRepository: jest.Mocked<Repository<Role>>;

  const mockPermission: Permission = {
    id: 1,
    resource: 'product',
    action: 'manage',
    scope: 'all',
    displayName: 'Manage Products',
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRoleRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: getRepositoryToken(Permission), useValue: mockRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionRepository = module.get(getRepositoryToken(Permission));
    roleRepository = module.get(getRepositoryToken(Role));
    jest.clearAllMocks();
  });

  describe('createPermission', () => {
    it('should create a permission successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockPermission);
      mockRepo.save.mockResolvedValue(mockPermission);

      const result = await service.createPermission(
        'product',
        'manage',
        'Manage Products',
        'all',
      );

      expect(result).toHaveProperty('resource', 'product');
      expect(result).toHaveProperty('action', 'manage');
      expect(mockRepo.create).toHaveBeenCalledWith({
        resource: 'product',
        action: 'manage',
        displayName: 'Manage Products',
        scope: 'all',
      });
    });

    it('should throw ConflictException if permission exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockPermission);

      await expect(
        service.createPermission('product', 'manage'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all permissions ordered by resource and action', async () => {
      mockRepo.find.mockResolvedValue([mockPermission]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { resource: 'ASC', action: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should return permission by id', async () => {
      mockRepo.findOne.mockResolvedValue(mockPermission);

      const result = await service.findById(1);

      expect(result).toEqual(mockPermission);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      mockRepo.findOne.mockResolvedValue(mockPermission);
      mockRepo.save.mockResolvedValue({
        ...mockPermission,
        displayName: 'Updated',
      });

      const result = await service.update(1, { displayName: 'Updated' });

      expect(result).toHaveProperty('displayName', 'Updated');
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      mockRepo.findOne.mockResolvedValue(mockPermission);
      mockRepo.remove.mockResolvedValue(mockPermission);

      await service.remove(1);

      expect(mockRepo.remove).toHaveBeenCalledWith(mockPermission);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserPermissions', () => {
    it('should return permissions for a role', async () => {
      mockRoleRepo.findOne.mockResolvedValue({
        id: 1,
        permissions: [mockPermission],
      } as Role);

      const result = await service.getUserPermissions(1);

      expect(result).toEqual(['manage:product']);
    });

    it('should return empty array for non-existent role', async () => {
      mockRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.getUserPermissions(999);

      expect(result).toEqual([]);
    });
  });

  describe('getUniqueResources', () => {
    it('should return unique resources', async () => {
      const qbMock = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ resource: 'product' }, { resource: 'order' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qbMock as any);

      const result = await service.getUniqueResources();

      expect(result).toEqual(['product', 'order']);
    });
  });

  describe('getUniqueActions', () => {
    it('should return unique actions', async () => {
      const qbMock = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ action: 'create' }, { action: 'read' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qbMock as any);

      const result = await service.getUniqueActions();

      expect(result).toEqual(['create', 'read']);
    });
  });

  describe('validatePermissionFormat', () => {
    it('should validate correct format', () => {
      expect(service.validatePermissionFormat('manage:product')).toBe(true);
      expect(service.validatePermissionFormat('read:order')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(service.validatePermissionFormat('invalid')).toBe(false);
      expect(service.validatePermissionFormat(':empty')).toBe(false);
      expect(service.validatePermissionFormat('empty:')).toBe(false);
    });
  });

  describe('findByResourceAndAction', () => {
    it('should find permission by resource and action', async () => {
      mockRepo.findOne.mockResolvedValue(mockPermission);

      const result = await service.findByResourceAndAction('product', 'manage');

      expect(result).toEqual(mockPermission);
    });
  });
});
