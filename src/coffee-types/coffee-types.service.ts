import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeTypeDto } from './dto/create-coffee-type.dto';
import { UpdateCoffeeTypeDto } from './dto/update-coffee-type.dto';
import { QueryCoffeeTypesDto } from './dto/query-coffee-types.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status, TastingNote } from '../../generated/prisma/client';

@Injectable()
export class CoffeeTypesService {
  constructor(private prisma: PrismaService) {}

  getTastingNotes() {
    return Object.values(TastingNote);
  }

  private toSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private mapImage(ct: any) {
    if (ct.imageUrl?.startsWith('data:')) {
      ct.imageUrl = `/coffee-types/${ct.id}/image`;
    }
    return ct;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.coffeeType.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.coffeeType.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateCoffeeTypeDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    const data: Record<string, unknown> = {
      name: dto.name, slug, origin: dto.origin, grade: dto.grade,
      description: dto.description, status: dto.status ?? Status.ACTIVE,
      imageUrl: dto.imageUrl ?? null,
      altitude: dto.altitude,
      processing: dto.processing,
      acidity: dto.acidity,
      body: dto.body,
      harvestSeason: dto.harvestSeason ?? [],
      tastingNotes: dto.tastingNotes ?? [],
      badgeText: dto.badgeText,
    };

    if (dto.gradeIds?.length) {
      data.grades = {
        create: dto.gradeIds.map((id: number) => ({ coffeeGradeId: id })),
      };
    }

    const ct = await this.prisma.coffeeType.create({
      data: data as any,
      include: { grades: { include: { coffeeGrade: true } } },
    });

    return this.mapImage(ct);
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
      this.prisma.coffeeType.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { grades: { include: { coffeeGrade: true } } },
      }),
      this.prisma.coffeeType.count({ where }),
    ]);
    return paginate(data.map((ct) => this.mapImage(ct)), total, page, limit);
  }

  async findOne(id: number) {
    const ct = await this.prisma.coffeeType.findUnique({
      where: { id },
      include: { grades: { include: { coffeeGrade: true } } },
    });
    if (!ct) throw new NotFoundException('Coffee type not found');
    return this.mapImage(ct);
  }

  async update(id: number, dto: UpdateCoffeeTypeDto) {
    const ct = await this.prisma.coffeeType.findUnique({ where: { id } });
    if (!ct) throw new NotFoundException('Coffee type not found');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) { data.name = dto.name; data.slug = await this.generateUniqueSlug(dto.name); }
    if (dto.origin !== undefined) data.origin = dto.origin;
    if (dto.grade !== undefined) data.grade = dto.grade;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.altitude !== undefined) data.altitude = dto.altitude;
    if (dto.processing !== undefined) data.processing = dto.processing;
    if (dto.acidity !== undefined) data.acidity = dto.acidity;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.harvestSeason !== undefined) data.harvestSeason = dto.harvestSeason;
    if (dto.tastingNotes !== undefined) data.tastingNotes = dto.tastingNotes;
    if (dto.badgeText !== undefined) data.badgeText = dto.badgeText;
    if (dto.status !== undefined) data.status = dto.status;

    if (dto.gradeIds !== undefined) {
      await this.prisma.coffeeTypeGrade.deleteMany({ where: { coffeeTypeId: id } });
      if (dto.gradeIds.length > 0) {
        data.grades = {
          create: dto.gradeIds.map((gid: number) => ({ coffeeGradeId: gid })),
        };
      }
    }

    await this.prisma.coffeeType.update({
      where: { id },
      data: data as any,
    });

    return this.findOne(id);
  }

  async delete(id: number) {
    const ct = await this.prisma.coffeeType.findUnique({ where: { id } });
    if (!ct) throw new NotFoundException('Coffee type not found');
    await this.prisma.coffeeType.delete({ where: { id } });
    return { message: 'Coffee type deleted successfully' };
  }
}
