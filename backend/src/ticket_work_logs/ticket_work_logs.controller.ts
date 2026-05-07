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
import { CreateTicketWorkLogDto } from './dto/create-ticket-work-log.dto';
import { UpdateTicketWorkLogDto } from './dto/update-ticket-work-log.dto';
import { TicketWorkLogsService } from './ticket_work_logs.service';


@Controller('admin/ticket-work-logs')
export class TicketWorkLogsController {
  constructor(private readonly ticketWorkLog: TicketWorkLogsService) {}

  @Get()
  findAll() {
    return this.ticketWorkLog.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketWorkLog.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTicketWorkLogDto) {
    return this.ticketWorkLog.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTicketWorkLogDto) {
    return this.ticketWorkLog.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketWorkLog.remove(id);
  }

}
