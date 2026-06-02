import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';

@Injectable()
export class BlogTagsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async create(dto: CreateBlogTagDto) {
    const slug = this.toSlug(dto.name);
    const existing = await this.prisma.blogTag.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Tag with this name already exists');
    return this.prisma.blogTag.create({ data: { name: dto.name, slug } });
  }

  async findAll() {
    return this.prisma.blogTag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, dto: UpdateBlogTagDto) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) { data.name = dto.name; data.slug = this.toSlug(dto.name); }
    return this.prisma.blogTag.update({ where: { id }, data });
  }

  async delete(id: number) {
    const tag = await this.prisma.blogTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return this.prisma.blogTag.delete({ where: { id } });
  }
}
