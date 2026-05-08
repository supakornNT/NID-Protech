import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateStaffTeamRoleDto } from './dto/create-staff-team-role.dto';
import { UpdateStaffTeamRoleDto } from './dto/update-staff-team-role.dto';
import type { StaffTeamRole } from './interfaces/staff-team-role.interface';

@Injectable()
export class StaffTeamRolesService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<StaffTeamRole[]> {
    const [rows] = await this.db.query<StaffTeamRole[]>(
      `SELECT
      staff_team_roles.id,
      staff_team_roles.staff_id,
      CONCAT(staffs.name, ' ', staffs.surname) AS staff_name,
      staff_team_roles.team_id,
      teams.name AS team_name,
      staff_team_roles.role_id,
      roles.name AS role_name,
      staff_team_roles.created_at
      FROM staff_team_roles
      LEFT JOIN staffs ON staffs.id = staff_team_roles.staff_id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      LEFT JOIN roles ON roles.id = staff_team_roles.role_id
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<StaffTeamRole | null> {
    const [rows] = await this.db.query<StaffTeamRole[]>(
      `SELECT
      staff_team_roles.id,
      staff_team_roles.staff_id,
      CONCAT(staffs.name, ' ', staffs.surname) AS staff_name,
      staff_team_roles.team_id,
      teams.name AS team_name,
      staff_team_roles.role_id,
      roles.name AS role_name,
      staff_team_roles.created_at
      FROM staff_team_roles
      LEFT JOIN staffs ON staffs.id = staff_team_roles.staff_id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      LEFT JOIN roles ON roles.id = staff_team_roles.role_id
      WHERE staff_team_roles.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateStaffTeamRoleDto): Promise<StaffTeamRole | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO staff_team_roles (staff_id, team_id, role_id) VALUES (?, ?, ?)',
      [dto.staffId, dto.teamId, dto.roleId],
    );

    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    dto: UpdateStaffTeamRoleDto,
  ): Promise<StaffTeamRole | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE staff_team_roles
      SET
        staff_id = ?,
        team_id = ?,
        role_id = ?
      WHERE id = ?`,
      [
        dto.staffId ?? current.staff_id,
        dto.teamId ?? current.team_id,
        dto.roleId ?? current.role_id,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM staff_team_roles WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
