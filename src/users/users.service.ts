import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { paginate, PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Role, Status } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: createUserDto.role ?? Role.ADMIN,
        status: createUserDto.status ?? Status.ACTIVE,
      },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sort = 'newest', role, status } = query;
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    const orderBy: Record<string, string> = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(users.map(({ password: _, ...rest }) => rest), total, page, limit);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async delete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }
    const data: Record<string, unknown> = {};
    if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.role !== undefined) data.role = updateUserDto.role;
    if (updateUserDto.status !== undefined) data.status = updateUserDto.status;
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { password: _, ...result } = updated;
    return result;
  }
}
