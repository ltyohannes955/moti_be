import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { QueryGalleryImagesDto } from './dto/query-gallery-images.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class GalleryImagesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private mapImage(image: any) {
    if (image.imageUrl?.startsWith('data:')) {
      image.imageUrl = `/gallery-images/${image.id}`;
    }
    return image;
  }

  async create(dto: CreateGalleryImageDto) {
    const slug = this.toSlug(dto.title);
    const category = await this.prisma.galleryCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Gallery category not found');

    const image = await this.prisma.galleryImage.create({
      data: {
        title: dto.title,
        slug,
        imageUrl: dto.imageUrl ?? '',
        description: dto.description,
        categoryId: dto.categoryId,
        status: dto.status ?? Status.ACTIVE,
      },
      include: { category: true },
    });

    return this.mapImage(image);
  }

  async findAll(query: QueryGalleryImagesDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', categoryId, status } = query;
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.galleryImage.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.galleryImage.count({ where }),
    ]);

    return paginate(data.map((img) => this.mapImage(img)), total, page, limit);
  }

  async findOne(id: number) {
    const image = await this.prisma.galleryImage.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!image) throw new NotFoundException('Gallery image not found');
    return this.mapImage(image);
  }

  async update(id: number, dto: UpdateGalleryImageDto) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Gallery image not found');

    if (dto.categoryId) {
      const category = await this.prisma.galleryCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Gallery category not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) { data.title = dto.title; data.slug = this.toSlug(dto.title); }
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.galleryImage.update({ where: { id }, data });
    return this.findOne(id);
  }

  async delete(id: number) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Gallery image not found');

    await this.prisma.galleryImage.delete({ where: { id } });
    return { message: 'Gallery image deleted successfully' };
  }
}
