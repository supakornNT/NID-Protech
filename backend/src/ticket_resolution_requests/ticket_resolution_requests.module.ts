import { Module } from '@nestjs/common';
import { CloseWorkController } from './close-work.controller';
import { CloseWorkService } from './close-work.service';

@Module({
  controllers: [CloseWorkController],
  providers: [CloseWorkService],
})
export class TicketResolutionRequestsModule {}
