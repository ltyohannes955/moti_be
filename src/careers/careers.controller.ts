import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { ApplyCareerDto } from './dto/apply-career.dto';
import { QueryCareersDto } from './dto/query-careers.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';

const cvOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'cvs'),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
    }
    cb(null, true);
  },
};

@Controller('careers')
export class CareersController {
  constructor(private service: CareersService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryCareersDto) { return this.service.findAll(query); }

  @Get(':id/applications')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  findCareerApplications(@Param('id', ParseIntPipe) id: number, @Query() query: QueryApplicationsDto) {
    return this.service.findApplications({ ...query, careerId: id });
  }

  @Get('applications')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  findApplications(@Query() query: QueryApplicationsDto) {
    return this.service.findApplications(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateCareerDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCareerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }

  @Public()
  @Post(':id/apply')
  @UseInterceptors(FileInterceptor('cv', cvOptions))
  apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyCareerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.apply(id, dto, file);
  }
}
