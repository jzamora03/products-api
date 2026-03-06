import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    const categories = ['SERVIDORES', 'CLOUD'];
    for (const name of categories) {
      const exists = await this.categoryRepo.findOne({ where: { name } });
      if (!exists) {
        await this.categoryRepo.save(this.categoryRepo.create({ name }));
        console.log(`✅ Categorías creadas correctamente: ${name}`);
      }
    }
  }
}