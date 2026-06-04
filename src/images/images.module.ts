import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImagesController } from './images.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ImagesController],
})
export class ImagesModule {}
