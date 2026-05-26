import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateStaffTeamRoleDto } from './dto/create-staff-team-role.dto';
import { SyncStaffTeamRolesDto } from './dto/sync-staff-team-roles.dto';
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
      staff_team_roles.created_at
      FROM staff_team_roles
      LEFT JOIN staffs ON staffs.id = staff_team_roles.staff_id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
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
      staff_team_roles.created_at
      FROM staff_team_roles
      LEFT JOIN staffs ON staffs.id = staff_team_roles.staff_id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      WHERE staff_team_roles.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateStaffTeamRoleDto): Promise<StaffTeamRole | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO staff_team_roles (staff_id, team_id) VALUES (?, ?)',
      [dto.staffId, dto.teamId],
    );

    return this.findOne(result.insertId);
  }

  async sync(dto: SyncStaffTeamRolesDto) {
    const staffId = Number(dto.staffId);
    const teamIds = Array.isArray(dto.teamIds)
      ? [...new Set(dto.teamIds.map((teamId) => Number(teamId)))]
      : [];

    if (!Number.isInteger(staffId) || staffId <= 0) {
      throw new BadRequestException('staffId must be a positive integer');
    }

    if (
      !teamIds.every((teamId) => Number.isInteger(teamId) && teamId > 0)
    ) {
      throw new BadRequestException('teamIds must contain positive integers');
    }

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [staffRows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM staffs WHERE id = ? LIMIT 1',
        [staffId],
      );

      if (staffRows.length === 0) {
        throw new BadRequestException('Staff not found');
      }

      if (teamIds.length > 0) {
        const [teamRows] = await connection.query<RowDataPacket[]>(
          `SELECT id FROM teams WHERE id IN (${teamIds.map(() => '?').join(', ')})`,
          teamIds,
        );

        if (teamRows.length !== teamIds.length) {
          throw new BadRequestException('Some teamIds do not exist');
        }
      }

      await connection.query(
        `
        DELETE FROM staff_team_roles
        WHERE staff_id = ?
          ${teamIds.length > 0 ? `AND team_id NOT IN (${teamIds.map(() => '?').join(', ')})` : ''}
      `,
        teamIds.length > 0 ? [staffId, ...teamIds] : [staffId],
      );

      if (teamIds.length > 0) {
        const [existingRows] = await connection.query<RowDataPacket[]>(
          `SELECT team_id AS teamId
           FROM staff_team_roles
           WHERE staff_id = ?
             AND team_id IN (${teamIds.map(() => '?').join(', ')})`,
          [staffId, ...teamIds],
        );

        const existingTeamIds = new Set(
          existingRows.map((row) => Number(row.teamId)),
        );
        const teamIdsToInsert = teamIds.filter(
          (teamId) => !existingTeamIds.has(teamId),
        );

        if (teamIdsToInsert.length > 0) {
          const values = teamIdsToInsert.map(() => '(?, ?)').join(', ');
          const params = teamIdsToInsert.flatMap((teamId) => [staffId, teamId]);

          await connection.query<ResultSetHeader>(
            `INSERT INTO staff_team_roles (staff_id, team_id) VALUES ${values}`,
            params,
          );
        }
      } else {
        await connection.query(
          'DELETE FROM staff_team_roles WHERE staff_id = ?',
          [staffId],
        );
      }

      await connection.commit();
      return { message: 'synced' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
        team_id = ?
      WHERE id = ?`,
      [
        dto.staffId ?? current.staff_id,
        dto.teamId ?? current.team_id,
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
