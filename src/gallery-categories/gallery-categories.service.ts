import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class GalleryCategoriesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async create(dto: CreateGalleryCategoryDto) {
    const slug = this.toSlug(dto.name);
    const existing = await this.prisma.galleryCategory.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');
    return this.prisma.galleryCategory.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest' } = query;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.galleryCategory.findMany({
        include: { _count: { select: { images: true } } }, orderBy,
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.galleryCategory.count(),
    ]);
    return paginate(data, total, page, limit);
  }

  async findOne(id: number) {
    const cat = await this.prisma.galleryCategory.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    cat.images = cat.images.map((img) => {
      if (img.imageUrl?.startsWith('data:')) {
        img.imageUrl = `/gallery-images/${img.id}`;
      }
      return img;
    });
    return cat;
  }

  async update(id: number, dto: UpdateGalleryCategoryDto) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) { data.name = dto.name; data.slug = this.toSlug(dto.name); }
    if (dto.description !== undefined) data.description = dto.description;
    return this.prisma.galleryCategory.update({ where: { id }, data });
  }

  async delete(id: number) {
    const cat = await this.prisma.galleryCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const count = await this.prisma.galleryImage.count({ where: { categoryId: id } });
    if (count > 0) throw new ConflictException('Cannot delete category with existing images');
    return this.prisma.galleryCategory.delete({ where: { id } });
  }
}
