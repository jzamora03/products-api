import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
@Index(['name'])
@Index(['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true })
  supplierId: string;

  @Column()
  categoryId: string;

  @Column({ length: 50, nullable: true })
  quantityPerUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  unitsInStock: number;

  @Column({ type: 'int', default: 0 })
  unitsOnOrder: number;

  @Column({ type: 'int', default: 0 })
  reorderLevel: number;

  @Column({ default: false })
  discontinued: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, { eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}