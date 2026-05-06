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
import { CreateReportConfirmationDto } from './dto/create-report-confirmation.dto';
import { UpdateReportConfirmationDto } from './dto/update-report-confirmation.dto';
import { ReportConfirmationsService } from './report_confirmations.service';


@Controller('admin/report-confirmations')
export class ReportConfirmationsController {
  constructor(private readonly reportConfirmation: ReportConfirmationsService) {}

  @Get()
  findAll() {
    return this.reportConfirmation.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportConfirmation.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReportConfirmationDto) {
    return this.reportConfirmation.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateReportConfirmationDto) {
    return this.reportConfirmation.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportConfirmation.remove(id);
  }

}
