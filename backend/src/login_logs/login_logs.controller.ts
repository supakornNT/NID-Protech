import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { LoginLogsService } from './login_logs.service';


@Controller('admin/login-logs')
export class LoginLogsController {
  constructor(private readonly loginLog: LoginLogsService) {}

  @Get()
  findAll() {
    return this.loginLog.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLog.findOne(id);
  }


}
