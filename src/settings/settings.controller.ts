import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Public()
  @Get()
  get() { return this.service.get(); }

  @Patch()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() dto: UpdateSettingsDto) { return this.service.update(dto); }
}
