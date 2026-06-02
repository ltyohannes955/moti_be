import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';

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

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest' } = query;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.blogTag.findMany({
        include: { _count: { select: { posts: true } } }, orderBy,
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.blogTag.count(),
    ]);
    return paginate(data, total, page, limit);
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
