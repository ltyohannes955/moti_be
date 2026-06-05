import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.setting.findFirst();
    if (!settings) {
      settings = await this.prisma.setting.create({ data: {} });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    let settings = await this.prisma.setting.findFirst();
    if (!settings) {
      settings = await this.prisma.setting.create({ data: dto as any });
    } else {
      settings = await this.prisma.setting.update({
        where: { id: settings.id },
        data: dto,
      });
    }
    return settings;
  }
}
