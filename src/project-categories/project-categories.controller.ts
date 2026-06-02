import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProjectCategoriesService } from './project-categories.service';
import { CreateProjectCategoryDto } from './dto/create-project-category.dto';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('project-categories')
export class ProjectCategoriesController {
  constructor(private service: ProjectCategoriesService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll(); }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateProjectCategoryDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
