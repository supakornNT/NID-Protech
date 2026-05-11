import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConfirmReportDto } from './dto/confirm-report.dto';
import { RateReportDto } from './dto/rate-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';
import type { GetReportsQuery } from './interfaces/public-report-list.interface';
import { UserPortalService } from './user_portal.service';

@Controller('user')
export class UserPortalController {
  constructor(private readonly userPortalService: UserPortalService) {}

  @Get('dashboard-summary')
  getDashboardSummary() {
    return this.userPortalService.getDashboardSummary();
  }

  @Get('reports')
  getReports(@Query() query: GetReportsQuery) {
    return this.userPortalService.getReports(query);
  }

  @Get('reports/track/:reportNo/pdf-data')
  getReportPdfData(@Param('reportNo') reportNo: string) {
    return this.userPortalService.getReportPdfData(reportNo);
  }

  @Get('reports/track/:reportNo')
  getReportTrack(@Param('reportNo') reportNo: string) {
    return this.userPortalService.getReportTrack(reportNo);
  }

  @Post('reports/:id/confirm')
  confirmReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ConfirmReportDto,
  ) {
    return this.userPortalService.confirmReport(id, body);
  }

  @Post('reports/:id/rating')
  rateReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RateReportDto,
  ) {
    return this.userPortalService.rateReport(id, body);
  }

  @Post('reports/:id/reject')
  rejectReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectReportDto,
  ) {
    return this.userPortalService.rejectReport(id, body);
  }
}
