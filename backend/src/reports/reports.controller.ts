import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { CreateRequestDto } from './dto/create-report.dto';
import { CreateInternalRequestDto } from './dto/create-report-internal.dto';
import { CreateExternalRequestDto } from './dto/create-report-external.dto';
import { CreateServiceRequestDto } from './dto/create-report-service.dto';
import { UpdateRequestDto } from './dto/update-report.dto';
import { RequestsService } from './reports.service';

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
  constructor(private readonly request: RequestsService) {}

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
    return this.request.createReportInternal(body, files ?? []);
  }

  @Post('external')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createExternal(
    @Body() body: CreateExternalRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.request.createReportExternal(body, files ?? []);
  }

  @Post('service')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createService(
    @Body() body: CreateServiceRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.request.createReportService(body, files ?? []);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRequestDto) {
    return this.request.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.request.remove(id);
  }
}
