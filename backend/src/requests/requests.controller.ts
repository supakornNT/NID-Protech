import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { normalizeUploadedFileName } from '../common/utils/upload-file-name.util';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';
import { ScreeningQueryDto } from './dto/ScreeningQueryDto.dto';

const requestsUploadDir = resolve(process.cwd(), '..', 'uploads', 'requests');

mkdirSync(requestsUploadDir, { recursive: true });

const internalStorage = diskStorage({
  destination: requestsUploadDir,
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const originalName = normalizeUploadedFileName(file.originalname);
    file.originalname = originalName;
    cb(null, `${unique}-${originalName}`);
  },
});

@Controller('requests')
export class RequestsController {
  constructor(private readonly request: RequestsService) {}

@Get("screening")
findScreening(@Query() query: ScreeningQueryDto) {
  return this.request.findScreening(query);
}
  @Get('detail')
  findDetail(@Query('id', ParseIntPipe) id: number) {
    return this.request.findDetail(id);
  }

  @Get('assign')
  findAssign() {
    return this.request.findAssign();
  }

  @Get('attachments')
  findAttachments(@Query('id', ParseIntPipe) id: number) {
    return this.request.findAttachments(id);
  }

  @Get()
  findAll() {
    return this.request.findAll();
  }

  @Get('tracking')
  findTracking() {
    return this.request.findTracking();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.request.findOne(id);
  }

  // @Post()
  // create(@Body() body: CreateRequestDto) {
  //   return this.request.create(body);
  // }

  @Post('internal')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createInternal(
    @Body() body: CreateInternalRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.request.createRequestInternal(body, files ?? []);
  }

  @Post('external')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createExternal(
    @Body() body: CreateExternalRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.request.createRequestExternal(body, files ?? []);
  }

  @Post('service')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createService(
    @Body() body: CreateServiceRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.request.createRequestService(body, files ?? []);
  }

  @Patch(':id/submit-work')
  submitWork(
    @Param('id', ParseIntPipe) id: number,
    @Body('staffId') staffId: number,
  ) {
    return this.request.submitWork(id, Number(staffId));
  }

  @Patch(':id/reject-work')
  rejectWork(
    @Param('id', ParseIntPipe) id: number,
    @Body('operatorId') operatorId: number,
    @Body('note') note: string,
  ) {
    return this.request.rejectWork(id, Number(operatorId), note ?? '');
  }

  @Patch('update/status')
  updateStatus(
    @Query('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.request.updateStatus(id, status);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRequestDto,
  ) {
    return this.request.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.request.remove(id);
  }

  @Patch('update/resolved')
  updateResolve(
    @Query('id', ParseIntPipe) id: number,
    @Body('resolved') resolved: string,
  ) {
    return this.request.updateResolved(id, resolved);
  }

  @Patch('update/due-at')
  updateDueAt(
    @Query('id', ParseIntPipe) id: number,
    @Body('dueAt') dueAt: string,
  ) {
    return this.request.updateDueAt(id, dueAt);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="report.pdf"')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const filePath = this.request.getPdfPath(id);
    if (!existsSync(filePath)) {
      res.status(404).send('Not found');
      return;
    }
    res.sendFile(filePath);
  }
}
