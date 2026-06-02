import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeTypeDto } from './dto/create-coffee-type.dto';
import { UpdateCoffeeTypeDto } from './dto/update-coffee-type.dto';
import { QueryCoffeeTypesDto } from './dto/query-coffee-types.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class CoffeeTypesService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async create(dto: CreateCoffeeTypeDto, file?: Express.Multer.File) {
    const slug = this.toSlug(dto.name);
    return this.prisma.coffeeType.create({
      data: {
        name: dto.name, slug, origin: dto.origin, grade: dto.grade,
        description: dto.description, status: dto.status ?? Status.ACTIVE,
        imageUrl: file ? `uploads/coffee-types/${file.filename}` : null,
      },
    });
  }

  async findAllActive(query: QueryCoffeeTypesDto) {
    return this.findAll({ ...query, status: Status.ACTIVE } as QueryCoffeeTypesDto);
  }

  async findAll(query: QueryCoffeeTypesDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', status } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.coffeeType.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.coffeeType.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findOne(id: number) {
    const ct = await this.prisma.coffeeType.findUnique({ where: { id } });
    if (!ct) throw new NotFoundException('Coffee type not found');
    return ct;
  }

  async update(id: number, dto: UpdateCoffeeTypeDto, file?: Express.Multer.File) {
    const ct = await this.prisma.coffeeType.findUnique({ where: { id } });
    if (!ct) throw new NotFoundException('Coffee type not found');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) { data.name = dto.name; data.slug = this.toSlug(dto.name); }
    if (dto.origin !== undefined) data.origin = dto.origin;
    if (dto.grade !== undefined) data.grade = dto.grade;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;

    if (file) {
      if (ct.imageUrl) {
        const oldPath = path.join(process.cwd(), ct.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.imageUrl = `uploads/coffee-types/${file.filename}`;
    }

    return this.prisma.coffeeType.update({ where: { id }, data });
  }

  async delete(id: number) {
    const ct = await this.prisma.coffeeType.findUnique({ where: { id } });
    if (!ct) throw new NotFoundException('Coffee type not found');
    if (ct.imageUrl) {
      const filePath = path.join(process.cwd(), ct.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return this.prisma.coffeeType.delete({ where: { id } });
  }
}
