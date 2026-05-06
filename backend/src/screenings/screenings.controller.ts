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
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import { ScreeningsService } from './screenings.service';


@Controller('admin/screenings')
export class ScreeningsController {
  constructor(private readonly screening: ScreeningsService) {}

  @Get()
  findAll() {
    return this.screening.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.screening.findOne(id);
  }

  @Post()
  create(@Body() body: CreateScreeningDto) {
    return this.screening.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateScreeningDto) {
    return this.screening.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.screening.remove(id);
  }

}
