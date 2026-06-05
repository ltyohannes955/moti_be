import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CoffeeGradesService } from './coffee-grades.service';
import { CreateCoffeeGradeDto } from './dto/create-coffee-grade.dto';
import { UpdateCoffeeGradeDto } from './dto/update-coffee-grade.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Role } from '../../generated/prisma/client';

@Controller('coffee-grades')
export class CoffeeGradesController {
  constructor(private service: CoffeeGradesService) {}

  @Public()
  @Get()
  findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query); }

  @Public()
  @Get('all')
  findAllUnpaginated() { return this.service.findAllUnpaginated(); }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateCoffeeGradeDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCoffeeGradeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
