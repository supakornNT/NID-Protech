import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import type { Team } from './interfaces/team.interface';
import { CountRow } from '@/customers/interfaces/admin.interface';
import { Adminteam, PublicAdminTeamList } from './interfaces/admin.interface';
import { GetTeamsQuery } from './interfaces/admin.interface';

@Injectable()
export class TeamsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  // async findAll(): Promise<Team[]> {
  //   const [rows] = await this.db.query<Team[]>(
  //     `SELECT
  //     teams.id,
  //     teams.name,
  //     teams.status,
  //     teams.created_at,
  //     teams.updated_at
  //     FROM teams
  //     `,
  //   );

  //   return rows;
  // }
  async findAll(query: GetTeamsQuery = {}): Promise<PublicAdminTeamList> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = query.search?.trim() ?? '';

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

    const [rows] = await this.db.query<[Adminteam]>(
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

    const total = Number(countRows[0]?.total ?? 0);

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
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO teams (name, status) VALUES (?, ?)',
      [dto.name, dto.status ?? 'active'],
    );

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateTeamDto): Promise<Team | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE teams
      SET
        name = ?,
        status = ?
      WHERE id = ?`,
      [dto.name ?? current.name, dto.status ?? current.status, id],
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
}
