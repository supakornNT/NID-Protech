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
import { CreateTicketStatusLogDto } from './dto/create-ticket-status-log.dto';
import { UpdateTicketStatusLogDto } from './dto/update-ticket-status-log.dto';
import { TicketStatusLogsService } from './ticket_status_logs.service';

@Controller('admin/ticket-status-logs')
export class TicketStatusLogsController {
  constructor(private readonly ticketStatusLog: TicketStatusLogsService) {}

  @Get()
  findAll() {
    return this.ticketStatusLog.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusLog.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTicketStatusLogDto) {
    return this.ticketStatusLog.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTicketStatusLogDto,
  ) {
    return this.ticketStatusLog.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketStatusLog.remove(id);
  }
}
