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
import { CreateTicketResolutionRequestDto } from './dto/create-ticket-resolution-request.dto';
import { UpdateTicketResolutionRequestDto } from './dto/update-ticket-resolution-request.dto';
import { TicketResolutionRequestsService } from './ticket_resolution_requests.service';

@Controller('admin/ticket-resolution-requests')
export class TicketResolutionRequestsController {
  constructor(
    private readonly ticketResolutionRequest: TicketResolutionRequestsService,
  ) {}

  @Get()
  findAll() {
    return this.ticketResolutionRequest.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketResolutionRequest.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTicketResolutionRequestDto) {
    return this.ticketResolutionRequest.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTicketResolutionRequestDto,
  ) {
    return this.ticketResolutionRequest.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketResolutionRequest.remove(id);
  }
}
