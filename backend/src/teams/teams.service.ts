import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import type { Team } from './interfaces/team.interface';

@Injectable()
export class TeamsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<Team[]> {
    const [rows] = await this.db.query<Team[]>(
      `SELECT
      teams.id,
      teams.name,
      teams.status,
      teams.created_at,
      teams.updated_at
      FROM teams
      `,
    );

    return rows;
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
      [
        dto.name,
        dto.status ?? 'active',
      ],
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
      [
        dto.name ?? current.name,
        dto.status ?? current.status,
        id,
      ],
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
