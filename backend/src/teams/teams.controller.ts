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
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';


@Controller('admin/teams')
export class TeamsController {
  constructor(private readonly team: TeamsService) {}

  @Get()
  findAll() {
    return this.team.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.team.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTeamDto) {
    return this.team.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTeamDto) {
    return this.team.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.team.remove(id);
  }

}
