import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@Injectable()
export class BlogCategoriesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async create(dto: CreateBlogCategoryDto) {
    const slug = this.toSlug(dto.name);
    const existing = await this.prisma.blogCategory.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');
    return this.prisma.blogCategory.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }

  async findAll() {
    return this.prisma.blogCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.blogCategory.findUnique({
      where: { id },
      include: { posts: { include: { blogPost: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: number, dto: UpdateBlogCategoryDto) {
    const cat = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) { data.name = dto.name; data.slug = this.toSlug(dto.name); }
    if (dto.description !== undefined) data.description = dto.description;
    return this.prisma.blogCategory.update({ where: { id }, data });
  }

  async delete(id: number) {
    const cat = await this.prisma.blogCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const count = await this.prisma.blogPostCategory.count({ where: { categoryId: id } });
    if (count > 0) throw new ConflictException('Cannot delete category with existing posts');
    return this.prisma.blogCategory.delete({ where: { id } });
  }
}
