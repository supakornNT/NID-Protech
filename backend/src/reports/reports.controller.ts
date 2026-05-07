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
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';


@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly report: ReportsService) {}

  @Get()
  findAll() {
    return this.report.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.report.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReportDto) {
    return this.report.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateReportDto) {
    return this.report.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.report.remove(id);
  }

}
