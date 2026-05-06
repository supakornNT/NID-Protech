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
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { AttachmentsService } from './attachments.service';


@Controller('admin/attachments')
export class AttachmentsController {
  constructor(private readonly attachment: AttachmentsService) {}

  @Get()
  findAll() {
    return this.attachment.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attachment.findOne(id);
  }

  @Post()
  create(@Body() body: CreateAttachmentDto) {
    return this.attachment.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAttachmentDto) {
    return this.attachment.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attachment.remove(id);
  }

}
