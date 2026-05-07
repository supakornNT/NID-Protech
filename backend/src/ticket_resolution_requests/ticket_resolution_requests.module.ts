import { Module } from '@nestjs/common';
import { TicketResolutionRequestsController } from './ticket_resolution_requests.controller';
import { TicketResolutionRequestsService } from './ticket_resolution_requests.service';

@Module({
  controllers: [TicketResolutionRequestsController],
  providers: [TicketResolutionRequestsService],
  exports: [TicketResolutionRequestsService],
})
export class TicketResolutionRequestsModule {}
