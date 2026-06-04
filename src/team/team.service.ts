import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { QueryTeamMembersDto } from './dto/query-team-members.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Status } from '../../generated/prisma/client';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto) {
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    const member = await this.prisma.teamMember.create({
      data: {
        name: dto.name,
        position: dto.position,
        departmentId: dto.departmentId,
        imageUrl: dto.imageUrl,
        bio: dto.bio,
        order: dto.order,
        status: dto.status ?? Status.ACTIVE,
      },
    });

    return this.findOne(member.id);
  }

  private mapImage(member: any) {
    if (member.imageUrl?.startsWith('data:')) {
      member.imageUrl = `/team/${member.id}/image`;
    }
    return member;
  }

  async findAll(query: QueryTeamMembersDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', departmentId, status } = query;
    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        include: { department: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.teamMember.count({ where }),
    ]);

    return paginate(data.map((m) => this.mapImage(m)), total, page, limit);
  }

  async findOne(id: number) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!member) throw new NotFoundException('Team member not found');
    return this.mapImage(member);
  }

  async update(id: number, dto: UpdateTeamMemberDto) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) throw new NotFoundException('Department not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.teamMember.update({ where: { id }, data });
    return this.findOne(id);
  }

  async delete(id: number) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Team member not found');

    await this.prisma.teamMember.delete({ where: { id } });
    return { message: 'Team member deleted successfully' };
  }
}
