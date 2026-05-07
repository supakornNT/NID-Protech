import { Module } from '@nestjs/common';
import { TicketWorkLogsController } from './ticket_work_logs.controller';
import { TicketWorkLogsService } from './ticket_work_logs.service';

@Module({
  controllers: [TicketWorkLogsController],
  providers: [TicketWorkLogsService],
  exports: [TicketWorkLogsService],
})
export class TicketWorkLogsModule {}
