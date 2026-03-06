import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength, IsInt, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @ApiProperty() @IsUUID() categoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() quantityPerUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) unitsInStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) unitsOnOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() discontinued?: boolean;
}

export class BulkCreateProductDto {
  @ApiProperty({ example: 100000 }) @IsInt() @IsPositive() @Type(() => Number) count: number;
  @ApiProperty() @IsUUID() categoryId: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() quantityPerUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) unitPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) unitsInStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) unitsOnOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() discontinued?: boolean;
}

export class ProductFilterDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number = 20;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) discontinued?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @ApiPropertyOptional({ default: 'createdAt' }) @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @ApiPropertyOptional({ default: 'DESC' }) @IsOptional() @IsString() sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ProductResponseDto {
  id: string;
  name: string;
  categoryId: string;
  category?: { id: string; name: string; picture?: string };
  quantityPerUnit?: string;
  unitPrice: number;
  unitsInStock: number;
  unitsOnOrder: number;
  reorderLevel: number;
  discontinued: boolean;
  createdAt: Date;

  static fromEntity(e: any): ProductResponseDto {
    return {
      id: e.id, name: e.name, categoryId: e.categoryId,
      category: e.category ? { id: e.category.id, name: e.category.name, picture: e.category.picture } : undefined,
      quantityPerUnit: e.quantityPerUnit,
      unitPrice: Number(e.unitPrice),
      unitsInStock: e.unitsInStock, unitsOnOrder: e.unitsOnOrder,
      reorderLevel: e.reorderLevel, discontinued: e.discontinued, createdAt: e.createdAt,
    };
  }
}

export class PaginatedProductsDto {
  data: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}