import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { LoginLogsService } from './login_logs.service';
import type {
  GetLoginLogChartQuery,
  GetLoginLogsQuery,
  LoginLogDateScopeQuery,
} from './interfaces/admin.interface';

@Controller('admin/login-logs')
export class LoginLogsController {
  constructor(private readonly loginLog: LoginLogsService) {}

  @Get()
  findAll(@Query() query: GetLoginLogsQuery) {
    return this.loginLog.findAll(query);
  }

  @Get('summary')
  getSummary(@Query() query: LoginLogDateScopeQuery) {
    return this.loginLog.getSummary(query);
  }

  @Get('meta')
  getMeta() {
    return this.loginLog.getMeta();
  }

  @Get('chart')
  getChart(@Query() query: GetLoginLogChartQuery) {
    return this.loginLog.getChart(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLog.findOne(id);
  }
}
