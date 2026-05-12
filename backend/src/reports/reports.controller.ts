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
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReportInternalDto } from './dto/create-report-internal.dto';
import { CreateReportExternalDto } from './dto/create-report-external.dto';
import { CreateReportServiceDto } from './dto/create-report-service.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

const reportsUploadDir = resolve(process.cwd(), '..', 'uploads', 'reports');

mkdirSync(reportsUploadDir, { recursive: true });

const internalStorage = diskStorage({
  destination: reportsUploadDir,
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + extname(file.originalname));
  },
});

@Controller('reports')
export class ReportsController {
  constructor(private readonly report: ReportsService) {}

  @Get()
  findAll() {
    return this.report.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.report.findOne(id);
  }

  @Post()
  create(@Body() body: CreateReportDto) {
    return this.report.create(body);
  }

  @Post('internal')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createInternal(
    @Body() body: CreateReportInternalDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.report.createReportInternal(body, files ?? []);
  }

  @Post('external')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createExternal(
    @Body() body: CreateReportExternalDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.report.createReportExternal(body, files ?? []);
  }

  @Post('service')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: internalStorage }))
  createService(
    @Body() body: CreateReportServiceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.report.createReportService(body, files ?? []);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateReportDto) {
    return this.report.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.report.remove(id);
  }
}
