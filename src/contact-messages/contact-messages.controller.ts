import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private service: ContactMessagesService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateContactMessageDto) { return this.service.create(dto); }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  findAll() { return this.service.findAll(); }
}
