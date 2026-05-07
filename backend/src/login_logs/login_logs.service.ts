import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';

import type { LoginLog } from './interfaces/login-log.interface';

@Injectable()
export class LoginLogsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<LoginLog[]> {
    const [rows] = await this.db.query<LoginLog[]>(
      `SELECT
      login_logs.id,
      login_logs.user_type,
      login_logs.user_id,
      login_logs.ip_address,
      login_logs.user_agent,
      login_logs.login_at,
      login_logs.status,
      login_logs.fail_reason
      FROM login_logs
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<LoginLog | null> {
    const [rows] = await this.db.query<LoginLog[]>(
      `SELECT
      login_logs.id,
      login_logs.user_type,
      login_logs.user_id,
      login_logs.ip_address,
      login_logs.user_agent,
      login_logs.login_at,
      login_logs.status,
      login_logs.fail_reason
      FROM login_logs
      WHERE login_logs.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }


}
