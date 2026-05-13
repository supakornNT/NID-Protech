import { Module } from '@nestjs/common';
import { RequestStatusLogsController } from './report_status_logs.controller';
import { RequestStatusLogsService } from './report_status_logs.service';

@Module({
  controllers: [RequestStatusLogsController],
  providers: [RequestStatusLogsService],
  exports: [RequestStatusLogsService],
})
export class RequestStatusLogsModule {}
