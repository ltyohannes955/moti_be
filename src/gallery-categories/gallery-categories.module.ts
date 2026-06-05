import { Module } from '@nestjs/common';
import { GalleryCategoriesController } from './gallery-categories.controller';
import { GalleryCategoriesService } from './gallery-categories.service';

@Module({
  controllers: [GalleryCategoriesController],
  providers: [GalleryCategoriesService],
  exports: [GalleryCategoriesService],
})
export class GalleryCategoriesModule {}
