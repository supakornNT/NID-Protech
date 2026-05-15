import {
  Body,
  Controller,
  Delete,
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
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

const requestsUploadDir = resolve(process.cwd(), '..', 'uploads', 'requests');

mkdirSync(requestsUploadDir, { recursive: true });

const internalStorage = diskStorage({
  destination: requestsUploadDir,
  filename(_req, file, cb) {
    cb(null, file.originalname);
  },
});

@Controller('requests')
export class RequestsController {
  constructor(private readonly request: RequestsService) {}

  @Get('screening')
  findScreening(@Query('type') type: string) {
    return this.request.findScreening(type);
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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.request.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRequestDto) {
    return this.request.create(body);
  }

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

  @Patch('update')
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
}
