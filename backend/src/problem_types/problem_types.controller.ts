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
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { UpdateProblemTypeDto } from './dto/update-problem-type.dto';
import { ProblemTypesService } from './problem_types.service';

@Controller('admin/problem-types')
export class ProblemTypesController {
  constructor(private readonly problemType: ProblemTypesService) {}

  @Get()
  findAll() {
    return this.problemType.findAll();
  }

  @Get('complaint')
  findComplain() {
    return this.problemType.findByRequestType('complaint');
  }

  @Get('issue')
  findIssue() {
    return this.problemType.findByRequestType('issue');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.problemType.findOne(id);
  }

  @Post()
  create(@Body() body: CreateProblemTypeDto) {
    return this.problemType.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProblemTypeDto,
  ) {
    return this.problemType.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.problemType.remove(id);
  }
}
