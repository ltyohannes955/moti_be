import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';

const multerOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'projects'),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
};

@Controller('projects')
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryProjectsDto) { return this.service.findAll(query); }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  create(@Body() dto: CreateProjectDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.service.create(dto, files);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.service.update(id, dto, files);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
