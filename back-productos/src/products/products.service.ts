import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto, BulkCreateProductDto, UpdateProductDto, ProductFilterDto, ProductResponseDto, PaginatedProductsDto } from './dto/product.dto';

const NAMES = ['PowerEdge', 'ProLiant', 'EPYC', 'Xeon', 'CloudNode', 'NVMe SSD', 'Switch', 'Firewall', 'GPUServer'];
const VENDORS = ['Dell', 'HP', 'IBM', 'Lenovo', 'Cisco', 'Supermicro'];
const UNITS = ['1 unit', '2 pack', '5 pack', 'rack unit'];

function randomProduct(categoryId: string) {
  return {
    id: randomUUID(),
    name: `${VENDORS[Math.floor(Math.random() * VENDORS.length)]} ${NAMES[Math.floor(Math.random() * NAMES.length)]} ${Math.floor(Math.random() * 9000) + 1000}`,
    categoryId,
    quantityPerUnit: UNITS[Math.floor(Math.random() * UNITS.length)],
    unitPrice: +(Math.random() * 9990 + 10).toFixed(2),
    unitsInStock: Math.floor(Math.random() * 500),
    unitsOnOrder: Math.floor(Math.random() * 50),
    reorderLevel: Math.floor(Math.random() * 20),
    discontinued: Math.random() < 0.05,
  };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.categoriesService.findEntityById(dto.categoryId);
    const saved = await this.repo.save(this.repo.create(dto));
    return ProductResponseDto.fromEntity(saved);
  }

  async bulkCreate(dto: BulkCreateProductDto): Promise<{ inserted: number; message: string }> {
    await this.categoriesService.findEntityById(dto.categoryId);
    const BATCH = 1000;
    let inserted = 0;
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      for (let i = 0; i < dto.count; i += BATCH) {
        const batch = Array.from({ length: Math.min(BATCH, dto.count - i) }, () => randomProduct(dto.categoryId));
        await qr.manager.createQueryBuilder().insert().into(Product).values(batch).execute();
        inserted += batch.length;
      }
      await qr.commitTransaction();
      return { inserted, message: `Successfully inserted ${inserted} products` };
    } catch (err) {
      await qr.rollbackTransaction();
      throw new BadRequestException(`Bulk insert failed: ${err.message}`);
    } finally {
      await qr.release();
    }
  }

  async findAll(f: ProductFilterDto): Promise<PaginatedProductsDto> {
    const { page = 1, limit = 20, search, categoryId, discontinued, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'DESC' } = f;
    const allowed = ['name', 'unitPrice', 'createdAt', 'unitsInStock'];
    const safe = allowed.includes(sortBy) ? sortBy : 'createdAt';
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .skip((page - 1) * limit).take(limit)
      .orderBy(`p.${safe}`, sortOrder);
    if (search) qb.andWhere('LOWER(p.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (discontinued !== undefined) qb.andWhere('p.discontinued = :discontinued', { discontinued });
    if (minPrice !== undefined) qb.andWhere('p.unitPrice >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('p.unitPrice <= :maxPrice', { maxPrice });
    const [items, total] = await qb.getManyAndCount();
    return { data: items.map(ProductResponseDto.fromEntity), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const p = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!p) throw new NotFoundException(`Product ${id} not found`);
    return ProductResponseDto.fromEntity(p);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Product ${id} not found`);
    if (dto.categoryId) await this.categoriesService.findEntityById(dto.categoryId);
    Object.assign(p, dto);
    await this.repo.save(p);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Product ${id} not found`);
    await this.repo.remove(p);
  }
}