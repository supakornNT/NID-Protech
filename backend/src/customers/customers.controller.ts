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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ResetCustomerPasswordDto } from './dto/reset-customer-password.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import type { GetCustomersQuery } from './interfaces/admin.interface';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customer: CustomersService) {}

  @Get()
  findAll() {
    return this.customer.findAll();
  }

  @Get('unapproved')
  findUnapproved(@Query() query: GetCustomersQuery) {
    return this.customer.findUnapproved(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customer.findOne(id);
  }
  @Get('name/:id')
  findName(@Param('id', ParseIntPipe) id: number) {
    return this.customer.findName(id);
  }

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.customer.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.customer.update(id, body);
  }

  @Post(':id/send-password-otp')
  sendPasswordOtp(@Param('id', ParseIntPipe) id: number) {
    return this.customer.sendPasswordResetOtp(id);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ResetCustomerPasswordDto,
  ) {
    return this.customer.resetPasswordWithOtp(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customer.remove(id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.customer.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.customer.reject(id);
  }

  @Patch(':id/inactive')
  inactive(@Param('id', ParseIntPipe) id: number) {
    return this.customer.inactive(id);
  }
}
