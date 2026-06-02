import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BlogTagsService } from './blog-tags.service';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Role } from '../../generated/prisma/client';

@Controller('blog-tags')
export class BlogTagsController {
  constructor(private service: BlogTagsService) {}

  @Public()
  @Get()
  findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateBlogTagDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogTagDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
