import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';

const mockCategory = { id: 'cat-1', name: 'SERVIDORES', picture: null, createdAt: new Date() };
const mockProduct = {
  id: 'prod-1', name: 'Dell R740', categoryId: 'cat-1',
  unitPrice: 2999, unitsInStock: 50, unitsOnOrder: 0,
  reorderLevel: 5, discontinued: false, createdAt: new Date(),
  category: mockCategory,
};

const mockQR = {
  connect: jest.fn(), startTransaction: jest.fn(),
  commitTransaction: jest.fn(), rollbackTransaction: jest.fn(), release: jest.fn(),
  manager: {
    createQueryBuilder: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    }),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: any;
  let categoriesService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(), save: jest.fn(), findOne: jest.fn(),
            remove: jest.fn(), createQueryBuilder: jest.fn(),
          },
        },
        { provide: CategoriesService, useValue: { findEntityById: jest.fn() } },
        { provide: DataSource, useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQR) } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = module.get(getRepositoryToken(Product));
    categoriesService = module.get(CategoriesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('crea un producto exitosamente', async () => {
    categoriesService.findEntityById.mockResolvedValue(mockCategory);
    repo.create.mockReturnValue(mockProduct);
    repo.save.mockResolvedValue(mockProduct);
    const result = await service.create({ name: 'Dell R740', categoryId: 'cat-1' });
    expect(result.name).toBe('Dell R740');
  });

  it('lanza NotFoundException si la categoría no existe', async () => {
    categoriesService.findEntityById.mockRejectedValue(new NotFoundException());
    await expect(service.create({ name: 'X', categoryId: 'bad' })).rejects.toThrow(NotFoundException);
  });

  it('retorna un producto con su categoría', async () => {
    repo.findOne.mockResolvedValue(mockProduct);
    const result = await service.findOne('prod-1');
    expect(result.id).toBe('prod-1');
    expect(result.category).toBeDefined();
  });

  it('lanza NotFoundException si el producto no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('elimina un producto', async () => {
    repo.findOne.mockResolvedValue(mockProduct);
    repo.remove.mockResolvedValue(mockProduct);
    await service.remove('prod-1');
    expect(repo.remove).toHaveBeenCalledWith(mockProduct);
  });

  it('bulk insert retorna el conteo correcto', async () => {
    categoriesService.findEntityById.mockResolvedValue(mockCategory);
    const result = await service.bulkCreate({ count: 2500, categoryId: 'cat-1' });
    expect(result.inserted).toBe(2500);
    expect(mockQR.commitTransaction).toHaveBeenCalled();
  });

  it('findAll retorna resultados paginados', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
    };
    repo.createQueryBuilder.mockReturnValue(qb);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });
});