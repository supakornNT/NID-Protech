import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
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

  @Get('attachments')
  findAttachments(@Query('id', ParseIntPipe) id: number) {
    return this.requestsService.findAttachments(id);
  }
}
