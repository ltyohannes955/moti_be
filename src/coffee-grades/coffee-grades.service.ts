import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeGradeDto } from './dto/create-coffee-grade.dto';
import { UpdateCoffeeGradeDto } from './dto/update-coffee-grade.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class CoffeeGradesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCoffeeGradeDto) {
    return this.prisma.coffeeGrade.create({ data: dto });
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest' } = query;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.coffeeGrade.findMany({
        include: { _count: { select: { coffeeTypes: true } } }, orderBy,
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.coffeeGrade.count(),
    ]);
    return paginate(data, total, page, limit);
  }

  async findAllUnpaginated() {
    return this.prisma.coffeeGrade.findMany({
      include: { _count: { select: { coffeeTypes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const grade = await this.prisma.coffeeGrade.findUnique({
      where: { id },
      include: { _count: { select: { coffeeTypes: true } } },
    });
    if (!grade) throw new NotFoundException('Coffee grade not found');
    return grade;
  }

  async update(id: number, dto: UpdateCoffeeGradeDto) {
    const grade = await this.prisma.coffeeGrade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException('Coffee grade not found');
    const data: Record<string, unknown> = {};
    if (dto.grade !== undefined) data.grade = dto.grade;
    if (dto.qualityLevel !== undefined) data.qualityLevel = dto.qualityLevel;
    if (dto.defects !== undefined) data.defects = dto.defects;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.coffeeGrade.update({ where: { id }, data });
  }

  async delete(id: number) {
    const grade = await this.prisma.coffeeGrade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException('Coffee grade not found');
    await this.prisma.coffeeGrade.delete({ where: { id } });
    return { message: 'Coffee grade deleted successfully' };
  }
}
