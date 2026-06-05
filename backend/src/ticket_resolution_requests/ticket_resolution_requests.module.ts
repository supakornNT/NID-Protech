import { Module } from '@nestjs/common';
import { CloseWorkController } from './close-work.controller';
import { CloseWorkService } from './close-work.service';
import { TicketResolutionRequestsController } from './ticket_resolution_requests.controller';
import { TicketResolutionRequestsService } from './ticket_resolution_requests.service';

@Module({
  controllers: [TicketResolutionRequestsController, CloseWorkController],
  providers: [TicketResolutionRequestsService, CloseWorkService],
  exports: [TicketResolutionRequestsService],
})
export class TicketResolutionRequestsModule {}
