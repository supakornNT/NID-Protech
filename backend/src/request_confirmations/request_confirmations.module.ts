import { Module } from '@nestjs/common';
import { RequestConfirmationsController } from './request_confirmations.controller';
import { RequestConfirmationsService } from './request_confirmations.service';

@Module({
  controllers: [RequestConfirmationsController],
  providers: [RequestConfirmationsService],
  exports: [RequestConfirmationsService],
})
export class RequestConfirmationsModule {}
