import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(dto: CreateProductCategoryDto) {
    let slug = this.toSlug(dto.name);
    const existing = await this.prisma.productCategory.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    return this.prisma.productCategory.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }

  async findAll() {
    return this.prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { products: { include: { images: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, dto: UpdateProductCategoryDto) {
    const category = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = this.toSlug(dto.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    return this.prisma.productCategory.update({ where: { id }, data });
  }

  async delete(id: number) {
    const category = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException('Cannot delete category with existing products');
    }
    return this.prisma.productCategory.delete({ where: { id } });
  }
}
