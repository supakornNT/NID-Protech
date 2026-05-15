import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdateTeamPermissionsDto } from './dto/update-team-permissions.dto';
import type { Team } from './interfaces/team.interface';
import { CountRow } from '@/customers/interfaces/admin.interface';
import {
  ACTIVE_STATUS_VALUES,
  getCountTotal,
  optionalText,
  positiveIntFromQuery,
  requireEnumValue,
  requireText,
} from '@/common/validation/input-rules';
import {
  Adminteam,
  GetTeamsQuery,
  PermissionIdRow,
  PublicAdminTeamList,
  TeamPermissionDetail,
  TeamPermissionItem,
  TeamPermissionRow,
} from './interfaces/admin.interface';

@Injectable()
export class TeamsService {
  constructor(@Inject('DB') private readonly db: Pool) {}
  async findAll(query: GetTeamsQuery = {}): Promise<PublicAdminTeamList> {
    const page = positiveIntFromQuery(query.page, 'page', 1);
    const limit = positiveIntFromQuery(query.limit, 'limit', 10, 100);
    const offset = (page - 1) * limit;
    const search = optionalText(query.search, 'search', 255) ?? '';

    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(`
      teams.name LIKE ?
    `);

      const like = `%${search}%`;
      params.push(like);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await this.db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM teams
      ${whereSql}
    `,
      params,
    );

    const [rows] = await this.db.query<Adminteam[]>(
      `
      SELECT
        teams.id,
        teams.name,
        teams.status,
        teams.created_at AS createdAt
      FROM teams
      ${whereSql}
      ORDER BY teams.created_at ASC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    );

    const total = getCountTotal(countRows, 0);

    return {
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Team | null> {
    const [rows] = await this.db.query<Team[]>(
      `SELECT
      teams.id,
      teams.name,
      teams.status,
      teams.created_at,
      teams.updated_at
      FROM teams
      WHERE teams.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(dto: CreateTeamDto): Promise<Team | null> {
    const name = requireText(dto.name, 'name', 255);
    const status =
      dto.status === undefined
        ? 'active'
        : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);

    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO teams (name, status) VALUES (?, ?)',
      [name, status],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const name =
      dto.name === undefined
        ? current.name
        : requireText(dto.name, 'name', 255);
    const status =
      dto.status === undefined
        ? current.status
        : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);

    await this.db.query<ResultSetHeader>(
      `UPDATE teams
      SET
        name = ?,
        status = ?
      WHERE id = ?`,
      [name, status, id],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'UPDATE teams SET status = ? WHERE id = ?',
      ['inactive', id],
    );

    return this.findOne(id);
  }

  async findPermissions(id: number): Promise<TeamPermissionDetail | null> {
    const team = await this.findOne(id);

    if (!team) {
      return null;
    }

    const [rows] = await this.db.query<TeamPermissionRow[]>(
      `
        SELECT
          permissions.id,
          permissions.code,
          permissions.name,
          permissions.created_at AS createdAt,
          CASE
            WHEN team_permissions.id IS NULL THEN 0
            ELSE 1
          END AS assigned
        FROM permissions
        LEFT JOIN team_permissions
          ON team_permissions.permission_id = permissions.id
          AND team_permissions.team_id = ?
        ORDER BY permissions.id ASC
      `,
      [id],
    );

    const permissions: TeamPermissionItem[] = rows.map(
      (row: TeamPermissionRow): TeamPermissionItem => ({
        id: row.id,
        code: row.code,
        name: row.name,
        assigned: row.assigned === 1,
      }),
    );

    return {
      team: {
        id: team.id,
        name: team.name,
        status: team.status,
      },
      permissions,
    };
  }

  async updatePermissions(
    id: number,
    dto: UpdateTeamPermissionsDto,
  ): Promise<TeamPermissionDetail | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const name =
      dto.name === undefined
        ? current.name
        : requireText(dto.name, 'name', 255);
    const status =
      dto.status === undefined
        ? current.status
        : requireEnumValue(dto.status, 'status', ACTIVE_STATUS_VALUES);
    const permissionIds = Array.isArray(dto.permissionIds)
      ? [...new Set(dto.permissionIds)]
      : [];

    if (
      !permissionIds.every(
        (permissionId) => Number.isInteger(permissionId) && permissionId > 0,
      )
    ) {
      throw new BadRequestException(
        'permissionIds must contain positive integers',
      );
    }

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query<ResultSetHeader>(
        `UPDATE teams
         SET name = ?, status = ?
         WHERE id = ?`,
        [name, status, id],
      );

      await connection.query<ResultSetHeader>(
        'DELETE FROM team_permissions WHERE team_id = ?',
        [id],
      );

      if (permissionIds.length > 0) {
        const [permissionRows] = await connection.query<PermissionIdRow[]>(
          `SELECT id FROM permissions WHERE id IN (${permissionIds.map(() => '?').join(', ')})`,
          permissionIds,
        );

        if (permissionRows.length !== permissionIds.length) {
          throw new BadRequestException('Some permissionIds do not exist');
        }

        const valuePlaceholders = permissionIds.map(() => '(?, ?)').join(', ');
        const insertParams = permissionIds.flatMap((permissionId) => [
          id,
          permissionId,
        ]);

        await connection.query<ResultSetHeader>(
          `INSERT INTO team_permissions (team_id, permission_id) VALUES ${valuePlaceholders}`,
          insertParams,
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.findPermissions(id);
  }
}
