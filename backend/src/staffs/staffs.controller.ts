import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffsService } from './staffs.service';

@Controller('admin/staffs')
export class StaffsController {
  constructor(private readonly staff: StaffsService) {}

  @Get()
  findAll() {
    return this.staff.findAll();
  }

  @Get('with-task-count')
  findWithTaskCount() {
    return this.staff.findWithTaskCount();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staff.findOne(id);
  }

  @Post()
  create(@Body() body: CreateStaffDto) {
    return this.staff.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStaffDto) {
    return this.staff.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staff.remove(id);
  }

  @Patch(':id/inactive')
  inactive(@Param('id', ParseIntPipe) id: number) {
    return this.staff.inactive(id);
  }

  @Patch(':id/active')
  active(@Param('id', ParseIntPipe) id: number) {
    return this.staff.active(id);
  }
}
