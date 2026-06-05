import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CoffeeTypesService } from './coffee-types.service';
import { CreateCoffeeTypeDto } from './dto/create-coffee-type.dto';
import { UpdateCoffeeTypeDto } from './dto/update-coffee-type.dto';
import { QueryCoffeeTypesDto } from './dto/query-coffee-types.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';
import { toBase64 } from '../common/utils/file.util';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const imageInterceptor = FileInterceptor('image', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

@Controller('coffee-types')
export class CoffeeTypesController {
  constructor(private service: CoffeeTypesService) {}

  @Public()
  @Get()
  findActive(@Query() query: QueryCoffeeTypesDto) { return this.service.findAllActive(query); }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(imageInterceptor)
  create(
    @Body() dto: CreateCoffeeTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) dto.imageUrl = toBase64(file);
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(imageInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoffeeTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) dto.imageUrl = toBase64(file);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
