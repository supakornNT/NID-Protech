import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

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
}
