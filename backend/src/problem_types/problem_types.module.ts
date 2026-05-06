import { Module } from '@nestjs/common';
import { ProblemTypesController } from './problem_types.controller';
import { ProblemTypesService } from './problem_types.service';

@Module({
  controllers: [ProblemTypesController],
  providers: [ProblemTypesService],
  exports: [ProblemTypesService],
})
export class ProblemTypesModule {}
