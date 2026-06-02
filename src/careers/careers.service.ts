import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { ApplyCareerDto } from './dto/apply-career.dto';
import { QueryCareersDto } from './dto/query-careers.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class CareersService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async create(dto: CreateCareerDto) {
    const slug = this.toSlug(dto.title);
    const existing = await this.prisma.career.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Career with this title already exists');
    const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.career.create({
      data: {
        title: dto.title, slug, type: dto.type, departmentId: dto.departmentId,
        description: dto.description, requirements: dto.requirements,
        location: dto.location, salary: dto.salary, status: dto.status ?? Status.ACTIVE,
      },
      include: { department: true },
    });
  }

  async findAll(query: QueryCareersDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', type, departmentId, status } = query;
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const include = { department: true, _count: { select: { applications: true } } };
    const [data, total] = await Promise.all([
      this.prisma.career.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.career.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findOne(id: number) {
    const career = await this.prisma.career.findUnique({
      where: { id }, include: { department: true },
    });
    if (!career) throw new NotFoundException('Career not found');
    return career;
  }

  async update(id: number, dto: UpdateCareerDto) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) throw new NotFoundException('Career not found');
    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException('Department not found');
    }
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) { data.title = dto.title; data.slug = this.toSlug(dto.title); }
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.requirements !== undefined) data.requirements = dto.requirements;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.salary !== undefined) data.salary = dto.salary;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.career.update({ where: { id }, data, include: { department: true } });
  }

  async delete(id: number) {
    const career = await this.prisma.career.findUnique({ where: { id } });
    if (!career) throw new NotFoundException('Career not found');
    return this.prisma.career.delete({ where: { id } });
  }

  async apply(careerId: number, dto: ApplyCareerDto, file?: Express.Multer.File) {
    if (!file) throw new NotFoundException('CV file is required');
    const career = await this.prisma.career.findUnique({ where: { id: careerId } });
    if (!career) throw new NotFoundException('Career not found');
    return this.prisma.application.create({
      data: {
        fullName: dto.fullName, email: dto.email, phoneNumber: dto.phoneNumber,
        coverLetter: dto.coverLetter,
        cvUrl: `uploads/cvs/${file.filename}`, careerId,
      },
    });
  }

  async findApplications(query: QueryApplicationsDto & { careerId?: number }) {
    const { page = 1, limit = 10, sort = 'newest', status, careerId } = query;
    const where: Record<string, unknown> = {};
    if (careerId) where.careerId = careerId;
    if (status) where.status = status;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const include = { career: true };
    const [data, total] = await Promise.all([
      this.prisma.application.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.application.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }
}
