import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientsDto } from './dto/query-clients.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';
import { toBase64 } from '../common/utils/file.util';

const MAX_LOGO_SIZE = 10 * 1024 * 1024;

const logoInterceptor = FileInterceptor('logo', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_LOGO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp|svg\+xml)$/)) {
      return cb(new BadRequestException('Only image files are allowed (jpg, png, gif, webp, svg)'), false);
    }
    cb(null, true);
  },
});

@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryClientsDto) {
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
  @UseInterceptors(logoInterceptor)
  create(
    @Body() dto: CreateClientDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) dto.logo = toBase64(file);
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(logoInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) dto.logo = toBase64(file);
    return this.service.update(id, dto);
  }

  @Post(':id/logo')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(logoInterceptor)
  uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updateLogo(id, toBase64(file));
  }

  @Delete(':id/logo')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  removeLogo(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeLogo(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
