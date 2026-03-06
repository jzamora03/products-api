import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mock = {
  id: 'uuid-1',
  name: 'SERVIDORES',
  description: null,
  picture: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  afterEach(() => jest.clearAllMocks());

  it('crea una categoría exitosamente', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(mock);
    repo.save.mockResolvedValue(mock);
    const result = await service.create({ name: 'SERVIDORES' });
    expect(result.name).toBe('SERVIDORES');
  });

  it('lanza ConflictException si ya existe', async () => {
    repo.findOne.mockResolvedValue(mock);
    await expect(service.create({ name: 'SERVIDORES' })).rejects.toThrow(ConflictException);
  });

  it('retorna una categoría por id', async () => {
    repo.findOne.mockResolvedValue(mock);
    expect((await service.findOne('uuid-1')).id).toBe('uuid-1');
  });

  it('lanza NotFoundException si no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('retorna todas las categorías', async () => {
    repo.find.mockResolvedValue([mock]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('elimina una categoría', async () => {
    repo.findOne.mockResolvedValue(mock);
    repo.remove.mockResolvedValue(mock);
    await service.remove('uuid-1');
    expect(repo.remove).toHaveBeenCalledWith(mock);
  });
});