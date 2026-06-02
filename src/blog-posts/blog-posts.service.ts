import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class BlogPostsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.blogPost.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.blogPost.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateBlogPostDto, file?: Express.Multer.File) {
    const slug = await this.generateUniqueSlug(dto.title);

    if (dto.categoryIds?.length) {
      for (const id of dto.categoryIds) {
        const cat = await this.prisma.blogCategory.findUnique({ where: { id } });
        if (!cat) throw new NotFoundException(`Blog category ${id} not found`);
      }
    }
    if (dto.tagIds?.length) {
      for (const id of dto.tagIds) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException(`Blog tag ${id} not found`);
      }
    }

    const post = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        imageUrl: file ? `uploads/blog-posts/${file.filename}` : null,
        status: dto.status ?? Status.ACTIVE,
        categories: dto.categoryIds?.length
          ? { create: dto.categoryIds.map((id) => ({ categoryId: id })) }
          : undefined,
        tags: dto.tagIds?.length
          ? { create: dto.tagIds.map((id) => ({ tagId: id })) }
          : undefined,
      },
    });

    return this.findOne(post.id);
  }

  async findAll() {
    return this.prisma.blogPost.findMany({
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: number, dto: UpdateBlogPostDto, file?: Express.Multer.File) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    if (dto.categoryIds) {
      for (const catId of dto.categoryIds) {
        const cat = await this.prisma.blogCategory.findUnique({ where: { id: catId } });
        if (!cat) throw new NotFoundException(`Blog category ${catId} not found`);
      }
    }
    if (dto.tagIds) {
      for (const tagId of dto.tagIds) {
        const tag = await this.prisma.blogTag.findUnique({ where: { id: tagId } });
        if (!tag) throw new NotFoundException(`Blog tag ${tagId} not found`);
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) { data.title = dto.title; data.slug = await this.generateUniqueSlug(dto.title); }
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.status !== undefined) data.status = dto.status;

    if (file) {
      if (post.imageUrl) {
        const oldPath = path.join(process.cwd(), post.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.imageUrl = `uploads/blog-posts/${file.filename}`;
    }

    await this.prisma.blogPost.update({ where: { id }, data });

    if (dto.categoryIds !== undefined) {
      await this.prisma.blogPostCategory.deleteMany({ where: { blogPostId: id } });
      if (dto.categoryIds.length > 0) {
        await this.prisma.blogPostCategory.createMany({
          data: dto.categoryIds.map((catId) => ({ blogPostId: id, categoryId: catId })),
        });
      }
    }

    if (dto.tagIds !== undefined) {
      await this.prisma.blogPostTag.deleteMany({ where: { blogPostId: id } });
      if (dto.tagIds.length > 0) {
        await this.prisma.blogPostTag.createMany({
          data: dto.tagIds.map((tagId) => ({ blogPostId: id, tagId })),
        });
      }
    }

    return this.findOne(id);
  }

  async delete(id: number) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    if (post.imageUrl) {
      const filePath = path.join(process.cwd(), post.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted successfully' };
  }
}
