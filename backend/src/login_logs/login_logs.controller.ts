import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { LoginLogsService } from './login_logs.service';
import type { GetLoginLogsQuery } from './interfaces/admin.interface';

@Controller('admin/login-logs')
export class LoginLogsController {
  constructor(private readonly loginLog: LoginLogsService) {}

  @Get()
  findAll(@Query() query: GetLoginLogsQuery) {
    return this.loginLog.findAll(query);
  }

  @Get('summary')
  getSummary() {
    return this.loginLog.getSummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLog.findOne(id);
  }
}
