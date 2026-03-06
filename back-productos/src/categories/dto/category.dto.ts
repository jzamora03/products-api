import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'SERVIDORES' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  picture?: string;
  createdAt: Date;

  static fromEntity(e: any): CategoryResponseDto {
    return {
      id: e.id,
      name: e.name,
      description: e.description,
      picture: e.picture,
      createdAt: e.createdAt,
    };
  }
}