import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ResetStaffPasswordDto } from './dto/reset-staff-password.dto';
import { SendStaffRegistrationOtpDto } from './dto/send-staff-registration-otp.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffsService } from './staffs.service';
import type { GetAdminStaffsQuery } from './interfaces/admin.interface';

@Controller('admin/staffs')
export class StaffsController {
  constructor(private readonly staff: StaffsService) {}

  @Get('users')
  findAdminUsers(@Query() query: GetAdminStaffsQuery) {
    return this.staff.findAdminUsers(query);
  }

  @Get('users/options')
  findAdminUserOptions() {
    return this.staff.findAdminUserOptions();
  }

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

  @Post('send-registration-otp')
  sendRegistrationOtp(@Body() body: SendStaffRegistrationOtpDto) {
    return this.staff.sendRegistrationOtp(body);
  }

  @Post('register')
  register(@Body() body: RegisterStaffDto) {
    return this.staff.register(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStaffDto) {
    return this.staff.update(id, body);
  }

  @Post(':id/send-password-otp')
  sendPasswordOtp(@Param('id', ParseIntPipe) id: number) {
    return this.staff.sendPasswordResetOtp(id);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ResetStaffPasswordDto,
  ) {
    return this.staff.resetPasswordWithOtp(id, body);
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
