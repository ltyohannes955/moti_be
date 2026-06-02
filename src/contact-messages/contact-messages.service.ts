import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { QueryContactMessagesDto } from './dto/query-contact-messages.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class ContactMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  async findAll(query: QueryContactMessagesDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', status, subject } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (subject) where.subject = subject;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }
}
