import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, BulkCreateProductDto, UpdateProductDto, ProductFilterDto, ProductResponseDto, PaginatedProductsDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Product')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single product' })
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.svc.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk generate random products' })
  bulkCreate(@Body() dto: BulkCreateProductDto): Promise<{ inserted: number; message: string }> {
    return this.svc.bulkCreate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with pagination and filters' })
  findAll(@Query() filters: ProductFilterDto): Promise<PaginatedProductsDto> {
    return this.svc.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with category photo' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.svc.remove(id);
  }
}