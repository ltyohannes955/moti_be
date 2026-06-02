import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.project.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.project.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateProjectDto, files?: Express.Multer.File[]) {
    const category = await this.prisma.projectCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Project category not found');
    const client = await this.prisma.organization.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client organization not found');

    const slug = await this.generateUniqueSlug(dto.title);

    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        clientId: dto.clientId,
        status: dto.status ?? Status.ACTIVE,
      },
    });

    if (files && files.length > 0) {
      await Promise.all(
        files.map((file) =>
          this.prisma.projectImage.create({
            data: { imageUrl: `uploads/projects/${file.filename}`, projectId: project.id },
          }),
        ),
      );
    }

    return this.findOne(project.id);
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: { category: true, client: true, images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { category: true, client: true, images: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: number, dto: UpdateProjectDto, files?: Express.Multer.File[]) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.categoryId) {
      const cat = await this.prisma.projectCategory.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new NotFoundException('Project category not found');
    }
    if (dto.clientId) {
      const client = await this.prisma.organization.findUnique({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Client organization not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      data.title = dto.title;
      data.slug = await this.generateUniqueSlug(dto.title);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.clientId !== undefined) data.clientId = dto.clientId;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.project.update({ where: { id }, data });

    if (files && files.length > 0) {
      const oldImages = await this.prisma.projectImage.findMany({ where: { projectId: id } });
      for (const img of oldImages) {
        const filePath = path.join(process.cwd(), img.imageUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await this.prisma.projectImage.deleteMany({ where: { projectId: id } });
      await Promise.all(
        files.map((file) =>
          this.prisma.projectImage.create({
            data: { imageUrl: `uploads/projects/${file.filename}`, projectId: id },
          }),
        ),
      );
    }

    return this.findOne(id);
  }

  async delete(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    const images = await this.prisma.projectImage.findMany({ where: { projectId: id } });
    for (const img of images) {
      const filePath = path.join(process.cwd(), img.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }
}
