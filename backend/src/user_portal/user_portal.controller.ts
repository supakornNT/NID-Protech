import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConfirmRequestDto } from './dto/confirm-report.dto';
import { RateRequestDto } from './dto/rate-report.dto';
import { RejectRequestDto } from './dto/reject-report.dto';
import type { GetRequestsQuery } from './interfaces/public-report-list.interface';
import { UserPortalService } from './user_portal.service';

@Controller('user')
export class UserPortalController {
  constructor(private readonly userPortalService: UserPortalService) {}

  @Get('dashboard-summary')
  getDashboardSummary() {
    return this.userPortalService.getDashboardSummary();
  }

  @Get('requests')
  getRequests(@Query() query: GetRequestsQuery) {
    return this.userPortalService.getRequests(query);
  }

  @Get('requests/track/:requestNo/pdf-data')
  getRequestPdfData(@Param('requestNo') requestNo: string) {
    return this.userPortalService.getRequestPdfData(requestNo);
  }

  @Get('requests/track/:requestNo')
  getRequestTrack(@Param('requestNo') requestNo: string) {
    return this.userPortalService.getRequestTrack(requestNo);
  }

  @Post('requests/:id/confirm')
  confirmRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ConfirmRequestDto,
  ) {
    return this.userPortalService.confirmRequest(id, body);
  }

  @Post('requests/:id/rating')
  rateRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RateRequestDto,
  ) {
    return this.userPortalService.rateRequest(id, body);
  }

  @Post('requests/:id/reject')
  rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectRequestDto,
  ) {
    return this.userPortalService.rejectRequest(id, body);
  }
}
