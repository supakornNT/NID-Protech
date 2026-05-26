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
} from '@nestjs/common';

import { CreateSystemDto } from './dto/create-system.dto';
import { SystemQueryDto } from './dto/query-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { SystemsService } from './systems.service';

@Controller('admin/systems')
export class SystemsController {
  constructor(private readonly system: SystemsService) {}

  @Get()
  findAll() {
    return this.system.findAll();
  }

  @Get('table')
  findTable(@Query() query: SystemQueryDto) {
    return this.system.findTable(query);
  }

  @Get('by-organization/:orgId')
  findByOrganization(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.system.findByOrganization(orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.system.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSystemDto) {
    return this.system.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSystemDto) {
    return this.system.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.system.remove(id);
  }
}
