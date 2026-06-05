import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GalleryImagesService } from './gallery-images.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { QueryGalleryImagesDto } from './dto/query-gallery-images.dto';
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

@Controller('gallery-images')
export class GalleryImagesController {
  constructor(private service: GalleryImagesService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryGalleryImagesDto) {
    return this.service.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(imageInterceptor)
  create(
    @Body() dto: CreateGalleryImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.imageUrl = toBase64(file);
    }
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(imageInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.imageUrl = toBase64(file);
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
