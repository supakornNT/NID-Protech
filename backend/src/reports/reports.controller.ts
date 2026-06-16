import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('executive')
  getExecutiveSummary() {
    return this.reports.getExecutiveSummary();
  }

  @Get('operations')
  getOperationsSummary() {
    return this.reports.getOperationsSummary();
  }

  @Get('edit-history')
  getEditHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.reports.getEditHistory({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      type,
    });
  }
}
