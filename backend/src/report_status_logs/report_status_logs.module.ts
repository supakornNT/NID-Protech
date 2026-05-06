import { Module } from '@nestjs/common';
import { ReportStatusLogsController } from './report_status_logs.controller';
import { ReportStatusLogsService } from './report_status_logs.service';

@Module({
  controllers: [ReportStatusLogsController],
  providers: [ReportStatusLogsService],
  exports: [ReportStatusLogsService],
})
export class ReportStatusLogsModule {}
