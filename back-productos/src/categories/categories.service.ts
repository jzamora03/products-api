import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`);
    const saved = await this.repo.save(this.repo.create(dto));
    return CategoryResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    return (await this.repo.find({ order: { createdAt: 'DESC' } })).map(CategoryResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return CategoryResponseDto.fromEntity(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    if (dto.name && dto.name !== cat.name) {
      const dup = await this.repo.findOne({ where: { name: dto.name } });
      if (dup) throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    Object.assign(cat, dto);
    return CategoryResponseDto.fromEntity(await this.repo.save(cat));
  }

  async remove(id: string): Promise<void> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    await this.repo.remove(cat);
  }

  async findEntityById(id: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }
}