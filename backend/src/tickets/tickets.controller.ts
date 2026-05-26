import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const uploadDir = resolve(process.cwd(), '..', 'uploads', 'requests');
mkdirSync(uploadDir, { recursive: true });

const storage = diskStorage({
  destination: uploadDir,
  filename(_req, file, cb) { cb(null, file.originalname); },
});

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

  @Get('my-work')
  findMyWork(@Query('staffId', ParseIntPipe) staffId: number) {
    return this.ticket.findMyWork(staffId);
  }

  @Get('my-requests')
  findMyRequests(@Query('staffId', ParseIntPipe) staffId: number) {
    return this.ticket.findMyRequests(staffId);
  }

  @Get('pending-close')
  findPendingClose() {
    return this.ticket.findPendingClose();
  }

  @Get('approval-history')
  findApprovalHistory() {
    return this.ticket.findApprovalHistory();
  }

  @Get('id')
  findById(@Query('id', ParseIntPipe) id: number) {
    return this.ticket.findById(id);
  }

  @Get(':id/work-detail')
  findWorkDetail(@Param('id', ParseIntPipe) id: number) {
    return this.ticket.findWorkDetail(id);
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

  @Get(':id/attachments')
  findAttachments(@Param('id', ParseIntPipe) ticketId: number) {
    return this.ticket.findTicketAttachments(ticketId);
  }

  @Patch(':id/attachments/hide')
  hideAttachments(@Param('id', ParseIntPipe) ticketId: number) {
    return this.ticket.hideTicketAttachments(ticketId);
  }

  @Patch('attachment/:id/hide')
  hideOneAttachment(@Param('id', ParseIntPipe) attachmentId: number) {
    return this.ticket.hideAttachment(attachmentId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  uploadAttachments(
    @Param('id', ParseIntPipe) ticketId: number,
    @Body('requestId') requestId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.ticket.uploadTicketAttachments(ticketId, Number(requestId), files ?? []);
  }
}
