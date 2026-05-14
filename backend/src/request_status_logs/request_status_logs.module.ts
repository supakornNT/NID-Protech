import { Module } from '@nestjs/common';
import { RequestStatusLogsController } from './request_status_logs.controller';
import { RequestStatusLogsService } from './request_status_logs.service';

@Module({
  controllers: [RequestStatusLogsController],
  providers: [RequestStatusLogsService],
  exports: [RequestStatusLogsService],
})
export class RequestStatusLogsModule {}
