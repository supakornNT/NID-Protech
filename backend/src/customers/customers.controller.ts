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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';


@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customer: CustomersService) {}

  @Get()
  findAll() {
    return this.customer.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customer.findOne(id);
  }

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.customer.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCustomerDto) {
    return this.customer.update(id, body);
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
