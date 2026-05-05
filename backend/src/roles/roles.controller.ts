import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateRoleDto) {
    return this.rolesService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRoleDto) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
