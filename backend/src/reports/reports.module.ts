import { Module } from '@nestjs/common';
import { RequestsController } from './reports.controller';
import { RequestsService } from './reports.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
