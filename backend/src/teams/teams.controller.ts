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
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdateTeamPermissionsDto } from './dto/update-team-permissions.dto';
import { TeamsService } from './teams.service';
import type { GetTeamsQuery } from './interfaces/admin.interface';

@Controller('admin/teams')
export class TeamsController {
  constructor(private readonly team: TeamsService) {}

  @Get()
  findAll(@Query() query: GetTeamsQuery) {
    return this.team.findAll(query);
  }

  @Get(':id/permissions')
  findPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.team.findPermissions(id);
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

  @Patch(':id/permissions')
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTeamPermissionsDto,
  ) {
    return this.team.updatePermissions(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.team.remove(id);
  }
}
