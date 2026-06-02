import { Module } from '@nestjs/common';
import { CoffeeTypesController } from './coffee-types.controller';
import { CoffeeTypesService } from './coffee-types.service';

@Module({
  controllers: [CoffeeTypesController],
  providers: [CoffeeTypesService],
})
export class CoffeeTypesModule {}
