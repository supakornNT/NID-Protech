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
import { CreateRequestStatusLogDto } from './dto/create-report-status-log.dto';
import { UpdateRequestStatusLogDto } from './dto/update-report-status-log.dto';
import { RequestStatusLogsService } from './report_status_logs.service';


@Controller('admin/request-status-logs')
export class RequestStatusLogsController {
  constructor(private readonly requestStatusLog: RequestStatusLogsService) {}

  @Get()
  findAll() {
    return this.requestStatusLog.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestStatusLog.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRequestStatusLogDto) {
    return this.requestStatusLog.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRequestStatusLogDto) {
    return this.requestStatusLog.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestStatusLog.remove(id);
  }

}
