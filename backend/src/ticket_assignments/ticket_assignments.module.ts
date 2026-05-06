import { Module } from '@nestjs/common';
import { TicketAssignmentsController } from './ticket_assignments.controller';
import { TicketAssignmentsService } from './ticket_assignments.service';

@Module({
  controllers: [TicketAssignmentsController],
  providers: [TicketAssignmentsService],
  exports: [TicketAssignmentsService],
})
export class TicketAssignmentsModule {}
