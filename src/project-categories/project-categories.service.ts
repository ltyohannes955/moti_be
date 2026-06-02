import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectCategoryDto } from './dto/create-project-category.dto';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto';

@Injectable()
export class ProjectCategoriesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(dto: CreateProjectCategoryDto) {
    const slug = this.toSlug(dto.name);
    const existing = await this.prisma.projectCategory.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');
    return this.prisma.projectCategory.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }

  async findAll() {
    return this.prisma.projectCategory.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const cat = await this.prisma.projectCategory.findUnique({
      where: { id },
      include: { projects: { include: { images: true, client: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: number, dto: UpdateProjectCategoryDto) {
    const cat = await this.prisma.projectCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = this.toSlug(dto.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    return this.prisma.projectCategory.update({ where: { id }, data });
  }

  async delete(id: number) {
    const cat = await this.prisma.projectCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    const count = await this.prisma.project.count({ where: { categoryId: id } });
    if (count > 0) throw new ConflictException('Cannot delete category with existing projects');
    return this.prisma.projectCategory.delete({ where: { id } });
  }
}
