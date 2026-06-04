import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { toBase64 } from '../common/utils/file.util';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.product.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.product.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const slug = await this.generateUniqueSlug(dto.name);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        status: dto.status ?? Status.ACTIVE,
      },
    });

    if (files && files.length > 0) {
      await Promise.all(
        files.map((file) =>
          this.prisma.productImage.create({
            data: {
              imageUrl: toBase64(file),
              productId: product.id,
            },
          }),
        ),
      );
    }

    return this.findOne(product.id);
  }

  private mapImages(images: { id: number; imageUrl: string }[]) {
    return images.map((img) => ({
      ...img,
      imageUrl: img.imageUrl?.startsWith('data:')
        ? `/product-images/${img.id}`
        : img.imageUrl,
    }));
  }

  async findAll(query: QueryProductsDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', categoryId, status, search } = query;
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, images: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    const mapped = products.map((p) => ({ ...p, images: this.mapImages(p.images) }));
    return paginate(mapped, total, page, limit);
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return { ...product, images: this.mapImages(product.images) };
  }

  async update(id: number, dto: UpdateProductDto, files?: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await this.generateUniqueSlug(dto.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.product.update({ where: { id }, data });

    if (files && files.length > 0) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      await Promise.all(
        files.map((file) =>
          this.prisma.productImage.create({
            data: {
              imageUrl: toBase64(file),
              productId: id,
            },
          }),
        ),
      );
    }

    return this.findOne(id);
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.productImage.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }
}
