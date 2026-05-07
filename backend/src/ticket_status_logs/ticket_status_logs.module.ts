import { Module } from '@nestjs/common';
import { TicketStatusLogsController } from './ticket_status_logs.controller';
import { TicketStatusLogsService } from './ticket_status_logs.service';

@Module({
  controllers: [TicketStatusLogsController],
  providers: [TicketStatusLogsService],
  exports: [TicketStatusLogsService],
})
export class TicketStatusLogsModule {}
