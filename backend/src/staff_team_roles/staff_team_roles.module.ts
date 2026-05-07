import { Module } from '@nestjs/common';
import { StaffTeamRolesController } from './staff_team_roles.controller';
import { StaffTeamRolesService } from './staff_team_roles.service';

@Module({
  controllers: [StaffTeamRolesController],
  providers: [StaffTeamRolesService],
  exports: [StaffTeamRolesService],
})
export class StaffTeamRolesModule {}
