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
import { extname, resolve } from 'path';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

const requestsUploadDir = resolve(process.cwd(), '..', 'uploads', 'requests');
mkdirSync(requestsUploadDir, { recursive: true });

const internalStorage = diskStorage({
  destination: requestsUploadDir,
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + extname(file.originalname));
  },
});

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // --- Staff screening endpoints ---
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

  @Patch('update')
  updateStatus(
    @Query('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.requestsService.updateStatus(id, status);
  }

  // --- CRUD endpoints ---
  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRequestDto) {
    return this.requestsService.create(body);
  }

  @Post('internal')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createInternal(
    @Body() body: CreateInternalRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.requestsService.createRequestInternal(body, files ?? []);
  }

  @Post('external')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createExternal(
    @Body() body: CreateExternalRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.requestsService.createRequestExternal(body, files ?? []);
  }

  @Post('service')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createService(
    @Body() body: CreateServiceRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.requestsService.createRequestService(body, files ?? []);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRequestDto) {
    return this.requestsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.remove(id);
  }
}
