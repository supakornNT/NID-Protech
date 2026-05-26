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
import { CreateTicketAssignmentDto } from './dto/create-ticket-assignment.dto';
import { UpdateTicketAssignmentDto } from './dto/update-ticket-assignment.dto';
import { TicketAssignmentsService } from './ticket_assignments.service';

@Controller('admin/ticket-assignments')
export class TicketAssignmentsController {
  constructor(private readonly ticketAssignment: TicketAssignmentsService) {}

  @Get()
  findAll() {
    return this.ticketAssignment.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketAssignment.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTicketAssignmentDto) {
    return this.ticketAssignment.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTicketAssignmentDto,
  ) {
    return this.ticketAssignment.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketAssignment.remove(id);
  }
}
