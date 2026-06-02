import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../../generated/prisma/client';

@Controller('admin')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get('search')
  search(@Query('q') q?: string) {
    return this.adminService.search(q ?? '');
  }
}
