import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffTeamRoleDto } from './create-staff-team-role.dto';

export class UpdateStaffTeamRoleDto extends PartialType(CreateStaffTeamRoleDto) {}
