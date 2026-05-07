import { Module } from '@nestjs/common';
import { ReportConfirmationsController } from './report_confirmations.controller';
import { ReportConfirmationsService } from './report_confirmations.service';

@Module({
  controllers: [ReportConfirmationsController],
  providers: [ReportConfirmationsService],
  exports: [ReportConfirmationsService],
})
export class ReportConfirmationsModule {}
