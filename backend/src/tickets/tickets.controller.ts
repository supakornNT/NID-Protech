import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('admin/tickets')
export class TicketsController {
  constructor(private readonly ticket: TicketsService) {}

  @Get('request')
  findAllByRequest(@Query('id', ParseIntPipe) id: number) {
    return this.ticket.findAllByRequest(id);
  }

  @Get('by-staff')
  findByStaff(@Query('staffId', ParseIntPipe) staffId: number) {
    return this.ticket.findByStaff(staffId);
  }

  @Get('id')
  findById(@Query('id', ParseIntPipe) id: number) {
    return this.ticket.findById(id);
  }

  @Post()
  createSubTicket(@Body() dto: CreateTicketDto) {
    return this.ticket.createSubTicket(dto);
  }

  @Patch(':id')
  updateSubTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticket.updateSubTicket(id, dto);
  }

  @Patch(':id/cancel')
  deletedSubTicket(@Param('id', ParseIntPipe) id: number) {
    return this.ticket.deleteSubticket(id);
  }
}
