import { Inject, Injectable } from '@nestjs/common';

import type { Pool, RowDataPacket } from 'mysql2/promise';
import type {
  RequestsAssign,
  RequestsDetail,
  RequestsScreening,
} from './interfaces/requests.interface';

@Injectable()
export class RequestsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findScreening(type: string) {
    const [rows] = await this.db.query<RequestsScreening[]>(
      `
      SELECT
        requests.id,
        requests.request_no AS requestNo,
        systems.name AS systemName,
        problem_types.request_type AS requestTypeName,
        requests.created_at AS createdAt
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE problem_types.request_type = ?
      AND requests.status = 'screening'
      `,
      [type],
    );
    return rows;
  }

  async findDetail(id: number) {
    const [rows] = await this.db.query<RequestsDetail[]>(
      `SELECT
        requests.id,
        requests.request_no AS requestNo,
        customers.name AS customerName,
        requests.organization AS organizationName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        requests.title AS title,
        requests.detail AS detail,
        requests.closed_at AS closedAt
      FROM requests 
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      WHERE requests.id = ?
      `,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAttachments(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name, saved_name, file_ext
       FROM attachments
       WHERE request_id = ?`,
      [requestId],
    );
    return rows;
  }

  async updateStatus(id: number, status: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `UPDATE
      requests SET status = ? WHERE id = ?
      `,
      [status, id],
    );
    return rows;
  }

  async findAssign() {
    const [rows] = await this.db.query<RequestsAssign[]>(
      `
      SELECT
      requests.id,
      requests.title,
      systems.name AS systemName,
      customers.name AS customerName,
      customers.surname AS customerSurname,
      problem_types.request_type AS probleTypeName,
      problem_types.name AS problemName
      FROM requests 
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE requests.status = 'assigned'
      `,
    );
    return rows;
  }
}
