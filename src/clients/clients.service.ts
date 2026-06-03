import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientsDto } from './dto/query-clients.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    let slug = this.toSlug(base);
    let exists = await this.prisma.organization.findUnique({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${this.toSlug(base)}-${counter}`;
      exists = await this.prisma.organization.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }

  async create(dto: CreateClientDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        type: dto.type,
        website: dto.website,
        description: dto.description,
        status: dto.status ?? Status.ACTIVE,
      },
    });

    return this.findOne(org.id);
  }

  async findAll(query: QueryClientsDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', type, status, search } = query;
    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: { projects: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { projects: true },
    });
    if (!org) throw new NotFoundException('Client not found');
    return org;
  }

  async update(id: number, dto: UpdateClientDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Client not found');

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await this.generateUniqueSlug(dto.name);
    }
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.organization.update({ where: { id }, data });
    return this.findOne(id);
  }

  async delete(id: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { projects: true },
    });
    if (!org) throw new NotFoundException('Client not found');

    if (org.projects.length > 0) {
      throw new ConflictException(
        `Cannot delete client with ${org.projects.length} existing project(s). Remove or reassign projects first.`,
      );
    }

    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Client deleted successfully' };
  }
}
