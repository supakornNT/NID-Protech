import { Controller, Get } from '@nestjs/common';
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
  getEditHistory() {
    return this.reports.getEditHistory();
  }
}
