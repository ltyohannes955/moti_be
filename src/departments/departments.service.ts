import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentsDto } from './dto/query-departments.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.department.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.department.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateDepartmentDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const dept = await this.prisma.department.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        status: dto.status ?? Status.ACTIVE,
      },
    });

    return this.findOne(dept.id);
  }

  async findAll(query: QueryDepartmentsDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', status } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        include: { teamMembers: true, careers: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.department.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { teamMembers: true, careers: true },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await this.generateUniqueSlug(dto.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.department.update({ where: { id }, data });
    return this.findOne(id);
  }

  async delete(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { teamMembers: true, careers: true },
    });
    if (!dept) throw new NotFoundException('Department not found');

    if (dept.teamMembers.length > 0 || dept.careers.length > 0) {
      throw new ConflictException(
        'Cannot delete department with existing team members or careers. Remove them first.',
      );
    }

    await this.prisma.department.delete({ where: { id } });
    return { message: 'Department deleted successfully' };
  }
}
