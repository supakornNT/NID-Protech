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
import { CreateReportStatusLogDto } from './dto/create-report-status-log.dto';
import { UpdateReportStatusLogDto } from './dto/update-report-status-log.dto';
import { ReportStatusLogsService } from './report_status_logs.service';


@Controller('admin/report-status-logs')
export class ReportStatusLogsController {
  constructor(private readonly reportStatusLog: ReportStatusLogsService) {}

  @Get()
  findAll() {
    return this.reportStatusLog.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportStatusLog.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReportStatusLogDto) {
    return this.reportStatusLog.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateReportStatusLogDto) {
    return this.reportStatusLog.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportStatusLog.remove(id);
  }

}
