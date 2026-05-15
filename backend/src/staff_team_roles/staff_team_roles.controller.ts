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
import { CreateStaffTeamRoleDto } from './dto/create-staff-team-role.dto';
import { UpdateStaffTeamRoleDto } from './dto/update-staff-team-role.dto';
import { StaffTeamRolesService } from './staff_team_roles.service';

@Controller('admin/staff-team-roles')
export class StaffTeamRolesController {
  constructor(private readonly staffTeamRole: StaffTeamRolesService) {}

  @Get()
  findAll() {
    return this.staffTeamRole.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffTeamRole.findOne(id);
  }

  @Post()
  create(@Body() body: CreateStaffTeamRoleDto) {
    return this.staffTeamRole.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStaffTeamRoleDto,
  ) {
    return this.staffTeamRole.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffTeamRole.remove(id);
  }
}
