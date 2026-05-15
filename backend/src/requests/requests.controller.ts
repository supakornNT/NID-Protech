import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('screening')
  findScreening(@Query('type') type: string) {
    return this.requestsService.findScreening(type);
  }

  @Get('detail')
  findDetail(@Query('id', ParseIntPipe) id: number) {
    return this.requestsService.findDetail(id);
  }

  @Get('assign')
  findAssign() {
    return this.requestsService.findAssign();
  }

  @Get('attachments')
  findAttachments(@Query('id', ParseIntPipe) id: number) {
    return this.requestsService.findAttachments(id);
  }

  @Patch('update/status')
  updateStatus(
    @Query('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.requestsService.updateStatus(id, status);
  }

  @Patch('update/resolved')
  updateResolve(
    @Query('id', ParseIntPipe) id: number,
    @Body('resolved') resolved: string,
  ) {
    return this.requestsService.updateResolved(id, resolved);
  }
}
