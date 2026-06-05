import { Module } from '@nestjs/common';
import { CoffeeGradesController } from './coffee-grades.controller';
import { CoffeeGradesService } from './coffee-grades.service';

@Module({
  controllers: [CoffeeGradesController],
  providers: [CoffeeGradesService],
  exports: [CoffeeGradesService],
})
export class CoffeeGradesModule {}
