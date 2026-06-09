import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CloseWorkService } from './close-work.service';
import { CloseWorkQueryDto } from './dto/close-work-query-dto.dto';

@Controller('admin/close-work')
export class CloseWorkController {
  constructor(private readonly closeWorkService: CloseWorkService) {}

  private getStaffId(req: Request, bodyStaffId?: number): number {
    const sessionStaffId = (req.session as any)?.staff?.id;
    const staffId = sessionStaffId ?? bodyStaffId;

    if (!staffId) {
      throw new UnauthorizedException('Authentication required');
    }

    return Number(staffId);
  }

  @Get('requests')
  getRequests(@Query() query: CloseWorkQueryDto) {
    const normalizedQuery: CloseWorkQueryDto = {
      status: query.status === 'history' ? 'history' : 'pending',
      page: Math.max(Number(query.page ?? 1), 1),
      limit: Math.min(Math.max(Number(query.limit ?? 4), 1), 100),
      search: String(query.search ?? '').trim(),
    };

    return this.closeWorkService.findRequests(normalizedQuery);
  }
  
  @Get('requests/:id/tickets')
  getRequestTickets(
    @Param('id', ParseIntPipe) requestId: number,
    @Query('status') status: 'pending' | 'history' = 'pending',
  ) {
    if (status !== 'pending' && status !== 'history') {
      throw new BadRequestException('Status must be pending or history');
    }

    return this.closeWorkService.findRequestTickets(requestId, status);
  }

  @Get('requests/:id/attachments')
  getRequestEvidence(@Param('id', ParseIntPipe) requestId: number) {
    return this.closeWorkService.findRequestEvidence(requestId);
  }

@Get('requests/:id/latest-reject')
getLatestReject(@Param('id', ParseIntPipe) requestId: number) {
  return this.closeWorkService.findLatestRejectComment(requestId);
}

  @Get('requests/:id/reopen-attachments')
  getReopenAttachments(@Param('id', ParseIntPipe) requestId: number) {
    return this.closeWorkService.findReopenAttachments(requestId);
  }

  @Get('tickets/:ticketId/attachments')
  getTicketAttachments(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.closeWorkService.findTicketResolutionEvidence(ticketId);
  }

  @Post('tickets/:ticketId/approve')
  approveTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('resolutionRequestId', ParseIntPipe) resolutionRequestId: number,
    @Body('reviewedBy') reviewedByBody: number,
    @Body('summary') summary: string | undefined,
    @Req() req: Request,
  ) {
    const reviewedBy = this.getStaffId(req, reviewedByBody);
    return this.closeWorkService.approveTicketResolution(
      ticketId,
      resolutionRequestId,
      reviewedBy,
      summary,
    );
  }

  @Post('tickets/:ticketId/reject')
  rejectTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body('resolutionRequestId', ParseIntPipe) resolutionRequestId: number,
    @Body('rejectReason') rejectReason: string,
    @Body('reviewedBy') reviewedByBody: number,
    @Req() req: Request,
  ) {
    if (!rejectReason || !rejectReason.trim()) {
      throw new BadRequestException('Reject reason is required');
    }

    const reviewedBy = this.getStaffId(req, reviewedByBody);
    return this.closeWorkService.rejectTicketResolution(
      ticketId,
      resolutionRequestId,
      reviewedBy,
      rejectReason,
    );
  }

  @Patch('requests/:id/change-state')
  changeRequestState(
    @Param('id', ParseIntPipe) requestId: number,
    @Body('status') status: string,
    @Body('note') note: string,
    @Body('changedById') changedByIdBody: number,
    @Req() req: Request,
  ) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }

    const changedById = this.getStaffId(req, changedByIdBody);
    return this.closeWorkService.changeRequestStatus(
      requestId,
      status,
      changedById,
      note,
    );
  }
}
