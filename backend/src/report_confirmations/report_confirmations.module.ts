import { Module } from '@nestjs/common';
import { RequestConfirmationsController } from './report_confirmations.controller';
import { RequestConfirmationsService } from './report_confirmations.service';

@Module({
  controllers: [RequestConfirmationsController],
  providers: [RequestConfirmationsService],
  exports: [RequestConfirmationsService],
})
export class RequestConfirmationsModule {}
