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
import { CreateRequestConfirmationDto } from './dto/create-report-confirmation.dto';
import { UpdateRequestConfirmationDto } from './dto/update-report-confirmation.dto';
import { RequestConfirmationsService } from './report_confirmations.service';


@Controller('admin/request-confirmations')
export class RequestConfirmationsController {
  constructor(private readonly requestConfirmation: RequestConfirmationsService) {}

  @Get()
  findAll() {
    return this.requestConfirmation.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfirmation.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRequestConfirmationDto) {
    return this.requestConfirmation.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRequestConfirmationDto) {
    return this.requestConfirmation.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestConfirmation.remove(id);
  }

}
