import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateExternalRequestDto } from './dto/create-request-external.dto';
import { CreateInternalRequestDto } from './dto/create-request-internal.dto';
import { CreateServiceRequestDto } from './dto/create-request-service.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import type { RequestRecord } from './interfaces/request.interface';
import type {
  RequestsAssign,
  RequestsDetail,
  RequestsScreening,
  RequestTracking,
  RequestTrackingLogRow,
  RequestTrackingRow,
} from './interfaces/requests.interface';
import { RequestTemplate, type RequestData } from './templates/report.template';
import { ScreeningQueryDto } from './dto/screening-query-dto.dto';
import { RequestAssignQueryDto } from './dto/request-assign-query.dto';
import { TrackingQueryDto } from './dto/tracking-query.dto';


@Injectable()
export class RequestsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findAll(): Promise<RequestRecord[]> {
    const [rows] = await this.db.query<RequestRecord[]>(
      `SELECT
        requests.id,
        requests.request_no,
        requests.customer_id,
        requests.system_id,
        requests.problem_type_id,
        requests.detail,
        CONCAT(customers.name, ' ', customers.surname) AS customer_name,
        requests.organization,
        systems.name AS system_name,
        problem_types.name AS problem_type_name,
        requests.title,
        requests.status,
        requests.score,
        requests.created_at,
        NULL AS resolve_due_at,
        requests.closed_at
      FROM requests
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id`,
    );

    return rows;
  }

  async findScreening(query: ScreeningQueryDto): Promise<{
    items: RequestsScreening[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const type = query.type === 'issue' ? 'issue' : 'complaint';
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = query.search?.trim() ?? '';

    const where: string[] = [
      `problem_types.request_type = ?`,
      `requests.status = 'screening'`,
    ];

    const params: Array<string | number> = [type];

    if (search) {
      where.push(`
      (
        requests.request_no LIKE ?
        OR systems.name LIKE ?
      )
    `);

      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [countRows] = await this.db.query<RowDataPacket[]>(
      `
    SELECT COUNT(*) AS total
    FROM requests
    LEFT JOIN systems ON systems.id = requests.system_id
    INNER JOIN problem_types ON problem_types.id = requests.problem_type_id
    ${whereSql}
    `,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const [rows] = await this.db.query<RequestsScreening[]>(
      `
  SELECT
    requests.id,
    requests.request_no AS requestNo,
    COALESCE(systems.name, '-') AS systemName,
    problem_types.request_type AS requestTypeName,
    problem_types.name AS problemName,
    requests.created_at AS createdAt
  FROM requests
  LEFT JOIN systems ON systems.id = requests.system_id
  INNER JOIN problem_types ON problem_types.id = requests.problem_type_id
  ${whereSql}
  ORDER BY requests.id DESC
  LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    return {
      items: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
  async findDetail(id: number): Promise<RequestsDetail | null> {
    const [rows] = await this.db.query<RequestsDetail[]>(
      `SELECT
        requests.id,
        requests.request_no AS requestNo,
        CONCAT(customers.name, ' ', customers.surname) AS customerName,
        requests.organization AS organizationName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        requests.title AS title,
        requests.detail AS detail,
        requests.status AS status,
        requests.closed_at AS closedAt,
        requests.due_at AS dueAt,
        CONCAT(s2.name, ' ', s2.surname) AS assignedStaffName,
        EXISTS (
          SELECT 1 FROM request_confirmations
          WHERE request_id = requests.id AND result = 'reopened'
        ) AS wasReopened,
        (
          SELECT comment FROM request_confirmations
          WHERE request_id = requests.id AND result = 'reopened'
          ORDER BY id DESC LIMIT 1
        ) AS latestReopenComment
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN tickets t ON t.id = (
        SELECT t2.id FROM tickets t2
        WHERE t2.request_id = requests.id
        ORDER BY t2.id DESC LIMIT 1
      )
      LEFT JOIN staffs s2 ON s2.id = t.assigned_staff_id
      WHERE requests.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findOne(id: number): Promise<RequestRecord | null> {
    const [rows] = await this.db.query<RequestRecord[]>(
      `SELECT
        requests.id,
        requests.request_no,
        requests.customer_id,
        requests.system_id,
        requests.problem_type_id,
        requests.detail,
        CONCAT(customers.name, ' ', customers.surname) AS customer_name,
        requests.organization,
        systems.name AS system_name,
        problem_types.name AS problem_type_name,
        requests.title,
        requests.status,
        requests.score,
        requests.created_at,
        NULL AS resolve_due_at,
        requests.closed_at
      FROM requests
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE requests.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async findAttachments(requestId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT id, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt
       FROM attachments
       WHERE request_id = ? AND ticket_id IS NULL AND status = 'show'`,
      [requestId],
    );

    return rows;
  }

  // async create(dto: CreateRequestDto): Promise<RequestRecord | null> {
  //   const [result] = await this.db.query<ResultSetHeader>(
  //     'INSERT INTO requests (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status, score, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  //     [
  //       dto.requestNo ?? dto.request_no,
  //       dto.customerId ?? dto.customer_id,
  //       dto.organization ?? null,
  //       dto.systemId ?? dto.system_id ?? null,
  //       dto.problemTypeId ?? dto.problem_type_id,
  //       dto.title,
  //       dto.detail,
  //       dto.status,
  //       dto.score ?? null,
  //       dto.closedAt ?? dto.closed_at ?? null,
  //     ],
  //   );

  //   return this.findOne(result.insertId);
  // }

  async update(
    id: number,
    dto: UpdateRequestDto,
  ): Promise<RequestRecord | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE requests
      SET
        request_no = ?,
        customer_id = ?,
        organization = ?,
        system_id = ?,
        problem_type_id = ?,
        title = ?,
        detail = ?,
        status = ?,
        score = ?,
        closed_at = ?
      WHERE id = ?`,
      [
        dto.request_no ?? current.request_no,
        dto.customer_id ?? current.customer_id,
        dto.organization ?? current.organization,
        dto.system_id ?? current.system_id,
        dto.problem_type_id ?? current.problem_type_id,
        dto.title ?? current.title,
        dto.detail ?? current.detail,
        dto.status ?? current.status,
        dto.score ?? current.score,
        dto.closed_at ?? current.closed_at,
        id,
      ],
    );

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    const [rows] = await this.db.query<ResultSetHeader>(
      'UPDATE requests SET status = ? WHERE id = ?',
      [status, id],
    );

    return rows;
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>('DELETE FROM requests WHERE id = ?', [
      id,
    ]);

    return { message: 'deleted' };
  }
async findAssign(query: RequestAssignQueryDto) {
  const {
    page = 1,
    limit = 4,
    search = '',
  } = query;

  const offset = (page - 1) * limit;

  const whereClauses = [
    `
      (
        requests.status = 'assigned'
        OR (
          requests.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = requests.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        )
      )
    `,
  ];

  const params: unknown[] = [];
  const searchText = search.trim();

  if (searchText !== '') {
    const keyword = `%${searchText}%`;

    whereClauses.push(`
      (
        requests.request_no LIKE ?
        OR requests.title LIKE ?
        OR systems.name LIKE ?
        OR customers.name LIKE ?
        OR customers.surname LIKE ?
        OR problem_types.name LIKE ?
      )
    `);

    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

  const [countRows] = await this.db.query<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS total
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      ${whereSql}
    `,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [rows] = await this.db.query<RequestsAssign[]>(
    `
      SELECT
        requests.id,
        requests.request_no AS requestNo,
        requests.title,
        systems.name AS systemName,
        customers.name AS customerName,
        customers.surname AS customerSurname,
        problem_types.request_type AS probleTypeName,
        problem_types.name AS problemName,
        CASE WHEN requests.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = requests.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        THEN 1 ELSE 0 END AS wasRejected
      FROM requests
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      ${whereSql}
      ORDER BY requests.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset],
  );

  return {
    items: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
  private async insertScreeningLog(requestId: number) {
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'screening', 'system', NULL, NULL)`,
      [requestId],
    );
  }

  private async generateRequestNo(prefix: 'REQ' | 'RPT'): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM requests
       WHERE request_no LIKE ?`,
      [`${prefix}-${dateStr}-%`],
    );

    const count = (rows[0]?.cnt as number) ?? 0;
    const seq = String(count + 1).padStart(4, '0');
    return `${prefix}-${dateStr}-${seq}`;
  }

  private async insertAttachments(
    requestId: number,
    files: Express.Multer.File[],
  ) {
    for (const file of files) {
      const ext = file.originalname.split('.').pop() ?? '';
      await this.db.query(
        'INSERT INTO attachments (request_id, original_name, saved_name, file_ext) VALUES (?, ?, ?, ?)',
        [requestId, file.originalname, file.filename, ext],
      );
    }
  }

  async createRequestInternal(
    dto: CreateInternalRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = await this.generateRequestNo('REQ');
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, organization, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id,
        dto.organization,
        dto.system_id,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    await this.insertScreeningLog(result.insertId);
    return { id: result.insertId, requestNo };
  }

  async createRequestExternal(
    dto: CreateExternalRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = await this.generateRequestNo('REQ');
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, system_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id,
        dto.system_id,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    await this.insertScreeningLog(result.insertId);
    return { id: result.insertId, requestNo };
  }

  async createRequestService(
    dto: CreateServiceRequestDto,
    files: Express.Multer.File[],
  ) {
    const requestNo = await this.generateRequestNo('RPT');
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO requests (request_no, customer_id, problem_type_id, title, detail, status)
       VALUES (?, ?, ?, ?, ?, 'screening')`,
      [
        requestNo,
        dto.customer_id ?? null,
        dto.problem_type_id,
        dto.title,
        dto.detail,
      ],
    );
    await this.insertAttachments(result.insertId, files);
    await this.insertScreeningLog(result.insertId);
    return { id: result.insertId, requestNo };
  }

  async updateResolved(id: number, resolved: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
      UPDATE
      requests SET resolved_at = ? WHERE id = ?
      `,
      [resolved, id],
    );
    return rows;
  }

  async submitWork(requestId: number, staffId: number) {
    await this.db.query(
      `UPDATE requests SET status = 'waiting_confirm' WHERE id = ?`,
      [requestId],
    );
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'waiting_confirm', 'staff', ?, NULL)`,
      [requestId, staffId],
    );
    return { success: true };
  }

  async rejectWork(requestId: number, operatorId: number, note: string) {
    await this.db.query(
      `UPDATE requests SET status = 'in_progress' WHERE id = ?`,
      [requestId],
    );
    await this.db.query(
      `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
       VALUES (?, 'in_progress', 'operator', ?, ?)`,
      [requestId, operatorId, note],
    );
    return { success: true };
  }

  async updateDueAt(id: number, dueAt: string) {
    await this.db.query(`UPDATE requests SET due_at = ? WHERE id = ?`, [
      dueAt,
      id,
    ]);
    await this.db.query(
      `UPDATE tickets
       SET due_at = ?
       WHERE request_id = ?
         AND status = 'assigned'
         AND due_at > ?`,
      [dueAt, id, dueAt],
    );
  }

  getPdfPath(id: number): string {
    return join(
      process.cwd(),
      '..',
      'uploads',
      'pdf',
      'screening',
      `${id}.pdf`,
    );
  }
async findTracking(query: TrackingQueryDto): Promise<{
  items: RequestTracking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const normalizedQuery = {
    page: Math.max(Number(query.page ?? 1), 1),
    limit: Math.min(Math.max(Number(query.limit ?? 10), 1), 100),
    search: query.search?.trim() ?? '',
    status: query.status?.trim(),
  };

  const offset = (normalizedQuery.page - 1) * normalizedQuery.limit;

  const whereClauses: string[] = [
    `r.status IN (
      'screening',
      'assigned',
      'in_progress',
      'waiting_confirm',
      'closed'
    )`,
  ];

  const values: Array<string | number> = [];

  if (normalizedQuery.search) {
    whereClauses.push(`
      (
        r.request_no LIKE ?
        OR r.title LIKE ?
        OR CONCAT(c.name, ' ', c.surname) LIKE ?
        OR s.name LIKE ?
      )
    `);

    const searchValue = `%${normalizedQuery.search}%`;
    values.push(searchValue, searchValue, searchValue, searchValue);
  }

  if (normalizedQuery.status) {
    whereClauses.push('r.status = ?');
    values.push(normalizedQuery.status);
  }

  const whereSql = whereClauses.join(' AND ');

  const baseFromSql = `
    FROM requests r
    LEFT JOIN customers c ON c.id = r.customer_id
    LEFT JOIN systems s ON s.id = r.system_id
    LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
    WHERE ${whereSql}
  `;

  const [countRows] = await this.db.query<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS total
      ${baseFromSql}
    `,
    values,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(
    1,
    Math.ceil(total / normalizedQuery.limit),
  );

  const [requests] = await this.db.query<RequestTrackingRow[]>(
    `
      SELECT
        r.id,
        r.request_no AS requestNo,
        r.title,
        r.status,
        r.created_at AS createdAt,
        r.due_at AS dueAt,
        CONCAT(c.name, ' ', c.surname) AS customerName,
        s.name AS systemName,
        pt.name AS problemName,
        CASE WHEN
          (SELECT COUNT(*) FROM tickets t2 WHERE t2.request_id = r.id
           AND t2.status NOT IN ('closed', 'cancelled')) = 0
          AND
          (SELECT COUNT(*) FROM tickets t2 WHERE t2.request_id = r.id
           AND t2.status != 'cancelled') > 0
        THEN 1 ELSE 0 END AS allResolved,
        CASE WHEN r.status = 'in_progress'
          AND EXISTS (
            SELECT 1 FROM request_status_logs
            WHERE request_id = r.id
              AND status = 'in_progress'
              AND changed_by_type = 'operator'
          )
        THEN 1 ELSE 0 END AS wasRejected
      ${baseFromSql}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, normalizedQuery.limit, offset],
  );

  if (requests.length === 0) {
    return {
      items: [],
      pagination: {
        total,
        page: normalizedQuery.page,
        limit: normalizedQuery.limit,
        totalPages,
      },
    };
  }

  const ids = requests.map((r) => r.id);

  const [logs] = await this.db.query<RequestTrackingLogRow[]>(
    `SELECT request_id, status, created_at
     FROM request_status_logs
     WHERE request_id IN (?)
     ORDER BY created_at ASC`,
    [ids],
  );

  const logMap = new Map<number, RequestTrackingLogRow[]>();

  for (const log of logs) {
    if (!logMap.has(log.request_id)) {
      logMap.set(log.request_id, []);
    }

    logMap.get(log.request_id)!.push(log);
  }

  const fmt = (d: Date | string | undefined, label: string) => {
    if (!d) return null;

    const dt = new Date(d);
    const h = String(dt.getHours()).padStart(2, '0');
    const m = String(dt.getMinutes()).padStart(2, '0');

    return {
      label,
      date: `${dt.getDate()}/${dt.getMonth() + 1}`,
      time: `${h}:${m}`,
    };
  };

  const findFirst = (
    logs: RequestTrackingLogRow[],
    status: string,
    after?: Date | string,
  ) => {
    const afterTime = after
      ? new Date(after).getTime()
      : Number.NEGATIVE_INFINITY;

    return logs.find(
      (log) =>
        log.status === status &&
        new Date(log.created_at).getTime() >= afterTime,
    );
  };

  const findLast = (
    logs: RequestTrackingLogRow[],
    status: string,
  ) => {
    for (let index = logs.length - 1; index >= 0; index -= 1) {
      if (logs[index].status === status) {
        return logs[index];
      }
    }

    return undefined;
  };

  const items = requests.map((r) => {
    const rLogs = logMap.get(r.id) ?? [];

    const screeningLog = findFirst(rLogs, 'screening');
    const firstAssignedLog = findFirst(rLogs, 'assigned');
    const currentAssignedLog = findLast(rLogs, 'assigned');

    const assignedCompletedLog = currentAssignedLog
      ? findFirst(rLogs, 'in_progress', currentAssignedLog.created_at) ??
        findFirst(rLogs, 'waiting_confirm', currentAssignedLog.created_at)
      : findFirst(rLogs, 'in_progress');

    const inProgressCompletedLog = assignedCompletedLog
      ? findFirst(rLogs, 'waiting_confirm', assignedCompletedLog.created_at)
      : undefined;

    const waitingConfirmCompletedLog = inProgressCompletedLog
      ? findFirst(rLogs, 'closed', inProgressCompletedLog.created_at)
      : undefined;

    const steps = [
      fmt(screeningLog?.created_at ?? r.createdAt, 'รับเรื่อง'),
      fmt(firstAssignedLog?.created_at, 'คัดกรอง'),
      fmt(assignedCompletedLog?.created_at, 'มอบหมายงาน'),
      fmt(inProgressCompletedLog?.created_at, 'ดำเนินการแก้ไข'),
      fmt(waitingConfirmCompletedLog?.created_at, 'รอลูกค้ายืนยัน'),
    ];

    return {
      id: r.id,
      requestNo: r.requestNo,
      title: r.title,
      status: r.status,
      customerName: r.customerName,
      systemName: r.systemName,
      problemName: r.problemName,
      dueAt: r.dueAt ? new Date(r.dueAt).toISOString() : null,
      allResolved: r.allResolved,
      wasRejected: r.wasRejected,
      steps,
    };
  });

  return {
    items,
    pagination: {
      total,
      page: normalizedQuery.page,
      limit: normalizedQuery.limit,
      totalPages,
    },
  };
}
}
