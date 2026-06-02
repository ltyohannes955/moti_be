import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { QueryTestimonialsDto } from './dto/query-testimonials.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: { ...dto, status: dto.status ?? Status.ACTIVE },
    });
  }

  async findAllActive(query: QueryTestimonialsDto) {
    return this.findAll({ ...query, status: Status.ACTIVE } as QueryTestimonialsDto);
  }

  async findAll(query: QueryTestimonialsDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', status } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.testimonial.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.testimonial.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async update(id: number, dto: UpdateTestimonialDto) {
    const t = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    const t = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
