import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
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
  StaffOption,
  StaffOptionRow,
  TeamMemberManagementItem,
  TeamMemberManagementMembership,
  TeamMemberManagementQuery,
  TeamMemberManagementResponse,
  TeamMemberManagementRow,
  TeamPermissionDetail,
  TeamPermissionItem,
  TeamPermissionSection,
  TeamPermissionRow,
  TeamMemberOption,
  TeamOptionRow,
} from './interfaces/admin.interface';

const PERMISSION_SECTION_TITLES: Record<string, string> = {
  screening: 'การคัดกรอง',
  report: 'การรายงาน',
  tracking: 'การติดตาม',
  operation: 'การปฏิบัติงาน',
  assignment: 'การมอบหมาย',
  management: 'การจัดการ',
};

const PERMISSION_SECTION_PREFIX_MAP: Record<string, string> = {
  admin: 'management',
};

function buildPermissionSections(
  permissions: TeamPermissionItem[],
): TeamPermissionSection[] {
  const grouped = new Map<string, TeamPermissionItem[]>();

  for (const permission of permissions) {
    const rawPrefix = permission.code.split('.')[0] ?? 'other';
    const sectionId = PERMISSION_SECTION_PREFIX_MAP[rawPrefix] ?? rawPrefix;
    const items = grouped.get(sectionId) ?? [];

    items.push(permission);
    grouped.set(sectionId, items);
  }

  return Array.from(grouped.entries()).map(([id, items]) => ({
    id,
    title: PERMISSION_SECTION_TITLES[id] ?? id,
    items,
  }));
}

type TeamUsageCountRow = CountRow;

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

  async findMemberManagement(
    query: TeamMemberManagementQuery = {},
  ): Promise<TeamMemberManagementResponse> {
    const page = positiveIntFromQuery(query.page, 'page', 1);
    const limit = positiveIntFromQuery(query.limit, 'limit', 10, 100);
    const offset = (page - 1) * limit;
    const search = optionalText(query.search, 'search', 255) ?? '';
    const teamId = query.teamId
      ? positiveIntFromQuery(query.teamId, 'teamId', 1)
      : undefined;
    const groupFilter = optionalText(query.groupFilter, 'groupFilter', 32);

    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(
        `(CONCAT(staffs.name, ' ', staffs.surname) LIKE ? OR staffs.email LIKE ? OR teams.name LIKE ?)`,
      );

      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (teamId !== undefined) {
      whereClauses.push('staff_team_roles.team_id = ?');
      params.push(teamId);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const havingSql =
      groupFilter === 'with-group'
        ? 'HAVING COUNT(DISTINCT staff_team_roles.id) > 0'
        : groupFilter === 'without-group'
          ? 'HAVING COUNT(DISTINCT staff_team_roles.id) = 0'
          : '';

    const [countRows] = await this.db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT staffs.id
        FROM staffs
        LEFT JOIN staff_team_roles ON staff_team_roles.staff_id = staffs.id
        LEFT JOIN teams ON teams.id = staff_team_roles.team_id
        ${whereSql}
        GROUP BY staffs.id, staffs.name, staffs.surname, staffs.email, staffs.status
        ${havingSql}
      ) AS member_management_count
    `,
      params,
    );

    const [rows] = await this.db.query<TeamMemberManagementRow[]>(
      `
      SELECT
        staffs.id,
        CONCAT(staffs.name, ' ', staffs.surname) AS fullName,
        staffs.email,
        staffs.status,
        GROUP_CONCAT(DISTINCT staff_team_roles.id ORDER BY staff_team_roles.id SEPARATOR ',') AS membershipIds,
        GROUP_CONCAT(DISTINCT teams.id ORDER BY teams.id SEPARATOR ',') AS teamIds,
        GROUP_CONCAT(DISTINCT teams.name ORDER BY teams.id SEPARATOR '||') AS teamNames
      FROM staffs
      LEFT JOIN staff_team_roles ON staff_team_roles.staff_id = staffs.id
      LEFT JOIN teams ON teams.id = staff_team_roles.team_id
      ${whereSql}
      GROUP BY staffs.id, staffs.name, staffs.surname, staffs.email, staffs.status
      ${havingSql}
      ORDER BY staffs.id ASC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    );

    const [[teamOptionRows], [staffOptionRows]] = await Promise.all([
      this.db.query<TeamOptionRow[]>(
        `
        SELECT
          teams.id AS value,
          teams.name AS label,
          teams.status
        FROM teams
        ORDER BY teams.created_at ASC
      `,
      ),
      this.db.query<StaffOptionRow[]>(
        `
        SELECT
          staffs.id AS value,
          CONCAT(staffs.name, ' ', staffs.surname) AS label
        FROM staffs
        ORDER BY staffs.name ASC, staffs.surname ASC, staffs.id ASC
      `,
      ),
    ]);

    const items: TeamMemberManagementItem[] = rows.map((row) => ({
      memberships: (row.membershipIds ? row.membershipIds.split(',') : []).map(
        (membershipId, index): TeamMemberManagementMembership => ({
          id: Number(membershipId),
          teamId: Number(row.teamIds?.split(',')[index] ?? 0),
          teamName: row.teamNames?.split('||')[index] ?? '',
        }),
      ),
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      status: row.status,
      teams: row.teamNames ? row.teamNames.split('||') : [],
      teamIds: row.teamIds
        ? row.teamIds
            .split(',')
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
        : [],
    }));

    const teams: TeamMemberOption[] = teamOptionRows.map((row) => ({
      value: row.value,
      label: row.label,
      status: row.status,
    }));
    const staffs: StaffOption[] = staffOptionRows.map((row) => ({
      value: row.value,
      label: row.label,
    }));
    const total = getCountTotal(countRows, 0);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filterOptions: {
        teams,
        staffs,
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

    const [duplicateRows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM teams
      WHERE LOWER(name) = LOWER(?)
      LIMIT 1
    `,
      [name],
    );

    if (duplicateRows.length > 0) {
      throw new BadRequestException('ชื่อกลุ่มผู้ใช้งานนี้มีอยู่แล้ว');
    }

    const [result] = await this.db.query<ResultSetHeader>(
      `
      INSERT INTO teams (
        name,
        status
      )
      VALUES (?, ?)
    `,
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

    const [duplicateRows] = await this.db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM teams
      WHERE LOWER(name) = LOWER(?)
        AND id <> ?
      LIMIT 1
    `,
      [name, id],
    );

    if (duplicateRows.length > 0) {
      throw new BadRequestException('ชื่อกลุ่มผู้ใช้งานนี้มีอยู่แล้ว');
    }

    await this.db.query<ResultSetHeader>(
      `
      UPDATE teams
      SET
        name = ?,
        status = ?
      WHERE id = ?
    `,
      [name, status, id],
    );

    return this.findOne(id);
  }

  private async getTeamUsageTotal(id: number): Promise<number> {
    const [staffTeamRoleRows] = await this.db.query<TeamUsageCountRow[]>(
      'SELECT COUNT(*) AS total FROM staff_team_roles WHERE team_id = ?',
      [id],
    );
    const [ticketRows] = await this.db.query<TeamUsageCountRow[]>(
      'SELECT COUNT(*) AS total FROM tickets WHERE assigned_team_id = ?',
      [id],
    );
    const [ticketAssignmentRows] = await this.db.query<TeamUsageCountRow[]>(
      'SELECT COUNT(*) AS total FROM ticket_assignments WHERE assigned_team_id = ?',
      [id],
    );

    return (
      getCountTotal(staffTeamRoleRows, 0) +
      getCountTotal(ticketRows, 0) +
      getCountTotal(ticketAssignmentRows, 0)
    );
  }

  async remove(id: number) {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    const usageTotal = await this.getTeamUsageTotal(id);

    if (usageTotal > 0) {
      throw new BadRequestException(
        'ไม่สามารถลบกลุ่มผู้ใช้งานที่มีการใช้งานอยู่ได้',
      );
    }

    await this.db.query<ResultSetHeader>('DELETE FROM teams WHERE id = ?', [
      id,
    ]);

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
      sections: buildPermissionSections(permissions),
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
