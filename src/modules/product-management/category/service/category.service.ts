// src/category/service/category.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../entity/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PaginatedServiceResponse } from 'src/shared/interface/api-response.interface';
import { CategoryQueryDto } from '../dto/query-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
      withDeleted: true,
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    // Verify parent category exists if provided
    let parentCategory: Category | null = null;
    if (createCategoryDto.parentId) {
      parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }

      // Check for circular dependency (prevent category from being its own parent)
      if (createCategoryDto.parentId === createCategoryDto.parentId) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }

    // Create category
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      ...(parentCategory ? { parent: parentCategory } : {}),
    });

    const savedCategory = await this.categoryRepository.save(category);
    return this.findOne(savedCategory.id);
  }

  async findAll(query: CategoryQueryDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      parentId,
      rootOnly,
      includeChildren,
      tree = false,
      includeProducts = false,
      includeDeleted = false,
    } = query;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    // If tree view is requested, return tree structure (no pagination)
    if (tree) {
      return this.getCategoryTree(search, rootOnly, includeProducts);
    }

    // If rootOnly is requested with no pagination parameters, return all root categories
    if (rootOnly && page === 1 && limit === 10) {
      const categories = await this.getRootCategories(
        search,
        includeChildren,
        includeProducts,
      );
      return {
        items: categories,
        pagination: {
          page: 1,
          limit: categories.length,
          total: categories.length,
          totalPages: 1,
        },
      };
    }

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent');

    // Include children if requested
    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    // Include products if requested
    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('category.products', 'products');
    }

    // Include deleted if requested
    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    // Apply filters
    if (rootOnly) {
      queryBuilder.where('category.parent IS NULL');
    } else if (parentId) {
      queryBuilder.where('category.parentId = :parentId', { parentId });
    }

    // Apply search filter
    if (search?.trim()) {
      queryBuilder.andWhere('category.name ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    // Apply pagination and ordering
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('category.createdAt', 'DESC')
      .addOrderBy('category.name', 'ASC')
      .getManyAndCount();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { name },
      relations: ['parent', 'children'],
    });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check name uniqueness if name is being updated
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const categoryWithName = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
        withDeleted: true,
      });

      if (categoryWithName && categoryWithName.id !== id) {
        throw new ConflictException(
          `Category with name ${updateCategoryDto.name} already exists`,
        );
      }
    }

    // Verify new parent category exists if provided
    let parentCategory: Category | null = existingCategory.parent || null;
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === null) {
        parentCategory = null;
      } else {
        // Prevent self-parenting
        if (updateCategoryDto.parentId === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }

        // Check for circular dependency
        await this.checkCircularDependency(id, updateCategoryDto.parentId);

        parentCategory = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parentId} not found`,
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(updateCategoryDto.name && { name: updateCategoryDto.name }),
      ...(updateCategoryDto.parentId !== undefined &&
        parentCategory !== null && { parent: parentCategory }),
      ...(updateCategoryDto.parentId !== undefined &&
        parentCategory === null && { parent: null }),
    };

    // Update category
    await this.categoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'products'],
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category that has child categories. Remove or reassign children first.',
      );
    }

    // Check if category has associated products
    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete category that has associated products. Remove product associations first.',
      );
    }

    await this.categoryRepository.softDelete(id);
  }

  async restore(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!category.deletedAt) {
      throw new BadRequestException('Category is not deleted');
    }

    await this.categoryRepository.restore(id);
    return this.findOne(id);
  }

  // Utility methods for query support

  /**
   * Get root categories with optional filtering
   * Supports search, includeChildren, and includeProducts
   */
  private async getRootCategories(
    search?: string,
    includeChildren?: boolean,
    includeProducts?: boolean,
  ): Promise<Category[]> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.parentId IS NULL');

    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('category.products', 'products');
    }

    if (search?.trim()) {
      queryBuilder.andWhere('category.name ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    return queryBuilder.orderBy('category.name', 'ASC').getMany();
  }

  /**
   * Get category tree (hierarchical structure)
   * Supports search and filtering
   */
  private async getCategoryTree(
    search?: string,
    rootOnly?: boolean,
    includeProducts?: boolean,
  ): Promise<Category[]> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('children.children', 'grandchildren');

    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('category.products', 'products');
    }

    if (rootOnly) {
      queryBuilder.where('category.parentId IS NULL');
    } else {
      queryBuilder.where('category.parentId IS NULL');
    }

    if (search?.trim()) {
      queryBuilder.andWhere('category.name ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    return queryBuilder.orderBy('category.name', 'ASC').getMany();
  }

  /**
   * Check circular dependency when updating parent
   */
  private async checkCircularDependency(
    categoryId: number,
    parentId: number,
  ): Promise<void> {
    let currentCategory = await this.categoryRepository.findOne({
      where: { id: parentId },
      relations: ['parent'],
    });

    while (currentCategory && currentCategory.parent) {
      if (currentCategory.parent.id === categoryId) {
        throw new BadRequestException(
          'Circular dependency detected. Category cannot be a parent of its ancestor.',
        );
      }
      currentCategory = await this.categoryRepository.findOne({
        where: { id: currentCategory.parent.id },
        relations: ['parent'],
      });
    }
  }
}
