import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { formatDateOnly as formatDateOnlyUtil } from '../common/utils/date-time.util';
import { parsePositiveInteger as parsePositiveIntegerUtil } from '../common/utils/number.util';
import { mapReportStatusLabel as mapReportStatusLabelUtil } from '../common/utils/report-status.util';
import { ConfirmReportDto } from './dto/confirm-report.dto';
import { RateReportDto } from './dto/rate-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';
import { DashboardSummary } from './interfaces/dashboard-summary.interface';
import {
  GetReportsQuery,
  PublicReportList,
} from './interfaces/public-report-list.interface';
import { PublicReportTrack } from './interfaces/public-report-track.interface';
import { mapTrackResponse } from './mappers/report-track.mapper';
import {
  ReportTrackRow,
  StatusLogRow,
} from './interfaces/report-track-row.interface';
import {
  validateConfirmReportDto,
  validateRateReportDto,
  validateRejectReportDto,
} from './validation/user-portal.validation';

interface DashboardSummaryRow extends RowDataPacket {
  total: number;
  screening: number;
  in_progress: number;
  completed: number;
}

interface PublicReportRow extends RowDataPacket {
  report_no: string;
  system_name: string | null;
  problem_name: string | null;
  resolve_due_at: Date | string | null;
  status: string;
}

interface ReportIdentityRow extends RowDataPacket {
  id: number;
  report_no: string;
  customer_id: number;
  status: string;
}

interface ExpiredWaitingConfirmRow extends RowDataPacket {
  report_id: number;
  customer_id: number;
  report_status: string;
  ticket_id: number;
  ticket_status: string;
  waiting_confirm_at: Date | string;
}

const REPORT_STATUS_VALUES = new Set([
  'screening',
  'assigned',
  'in_progress',
  'waiting_confirm',
  'closed',
  'rejected',
]);

const AUTO_CLOSE_NOTE =
  'System auto-closed after customer confirmation deadline expired';

@Injectable()
export class UserPortalService {
  constructor(
    @Inject('DB')
    private readonly db: Pool,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    await this.syncExpiredWaitingConfirmReports();

    const [rows] = await this.db.query<DashboardSummaryRow[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN r.status = 'screening' THEN 1 ELSE 0 END) AS screening,
        SUM(CASE WHEN r.status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN r.status = 'closed' THEN 1 ELSE 0 END) AS completed
      FROM reports r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
     `,
    );

    const summary = rows[0];

    return {
      total: Number(summary?.total ?? 0),
      screening: Number(summary?.screening ?? 0),
      inProgress: Number(summary?.in_progress ?? 0),
      completed: Number(summary?.completed ?? 0),
    };
  }

  async getReports(query: GetReportsQuery): Promise<PublicReportList> {
    await this.syncExpiredWaitingConfirmReports();

    const page = parsePositiveIntegerUtil(query.page, 1, 'page');
    const limit = Math.min(
      parsePositiveIntegerUtil(query.limit, 10, 'limit'),
      100,
    );
    const search = query.search?.trim() ?? '';
    const status = query.status?.trim() ?? '';
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    // TODO:
    // หลังจากทำ login แล้ว
    // ต้อง filter ด้วย customer_id จาก JWT token

    if (search.length > 0) {
      const likeSearch = `%${search}%`;
      whereClauses.push(`(
        r.report_no LIKE ?
        OR r.title LIKE ?
        OR COALESCE(s.name, '') LIKE ?
      )`);
      params.push(likeSearch, likeSearch, likeSearch);
    }

    if (status.length > 0) {
      if (!REPORT_STATUS_VALUES.has(status)) {
        throw new BadRequestException('status is invalid');
      }

      whereClauses.push('r.status = ?');
      params.push(status);
    }

    const whereSql =
      whereClauses.length > 0 ? ` AND ${whereClauses.join(' AND ')}` : ``;

    const [countRows] = await this.db.query<
      Array<RowDataPacket & { total: number }>
    >(
      `SELECT COUNT(*) AS total
      FROM reports r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN systems s
        ON r.system_id = s.id
      ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const [rows] = await this.db.query<PublicReportRow[]>(
      `SELECT
        r.report_no,
        s.name AS system_name,
        pt.name AS problem_name,
        r.resolve_due_at,
        r.status
      FROM reports r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN systems s
        ON r.system_id = s.id
      ${whereSql}
      ORDER BY r.created_at DESC
      LIMIT ?
      OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      items: rows.map((row) => ({
        trackingNo: row.report_no,
        system: row.system_name ?? '-',
        problem: row.problem_name ?? '-',
        dueDate: formatDateOnlyUtil(row.resolve_due_at),
        document: `tracking-${row.report_no}.pdf`,
        status: mapReportStatusLabelUtil(row.status),
      })),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrevious: safePage > 1,
      },
    };
  }

  async getReportTrack(reportNo: string): Promise<PublicReportTrack> {
    await this.syncExpiredWaitingConfirmReports();

    const report = await this.findReportTrackRowByReportNo(reportNo);

    if (!report) {
      throw new NotFoundException(`Report ${reportNo} not found`);
    }

    const [reportStatusLogs] = await this.db.query<StatusLogRow[]>(
      `SELECT new_status, created_at
      FROM report_status_logs
      WHERE report_id = ?
      ORDER BY created_at ASC, id ASC`,
      [report.id],
    );

    return mapTrackResponse(report, reportStatusLogs);
  }

  async confirmReport(
    id: number,
    dto: ConfirmReportDto,
  ): Promise<PublicReportTrack> {
    validateConfirmReportDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findReportIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Report ${id} not found`);
      }

      if (identity.status !== 'waiting_confirm') {
        throw new BadRequestException(
          'report is not waiting for customer confirmation',
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO report_confirmations (
          report_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'confirmed', ?, NULL)`,
        [identity.id, identity.customer_id, dto.comment ?? null],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE reports
        SET status = 'closed',
            closed_at = NOW()
        WHERE id = ?`,
        [identity.id],
      );

      const [ticketRows] = await connection.query<
        Array<RowDataPacket & { id: number; status: string }>
      >(
        `SELECT id, status
        FROM tickets
        WHERE report_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE tickets
        SET status = 'closed',
            closed_at = NOW()
        WHERE report_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO report_status_logs (
          report_id,
          old_status,
          new_status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, ?, 'closed', 'customer', ?, ?)`,
        [
          identity.id,
          identity.status,
          identity.customer_id,
          dto.comment ?? null,
        ],
      );

      for (const ticket of ticketRows) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'closed', NULL, ?)`,
          [
            ticket.id,
            ticket.status,
            dto.comment ?? 'Customer confirmed completion',
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getReportTrackByIdAfterMutation(id);
  }

  async rateReport(id: number, dto: RateReportDto): Promise<PublicReportTrack> {
    validateRateReportDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findReportIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Report ${id} not found`);
      }

      if (identity.status !== 'closed') {
        throw new BadRequestException('report is not closed');
      }

      const [confirmationRows] = await connection.query<
        Array<RowDataPacket & { id: number }>
      >(
        `SELECT id
        FROM report_confirmations
        WHERE report_id = ?
          AND result = 'confirmed'
        ORDER BY id DESC
        LIMIT 1`,
        [identity.id],
      );

      const confirmationId = Number(confirmationRows[0]?.id ?? 0);

      if (confirmationId <= 0) {
        throw new NotFoundException(`Confirmation for report ${id} not found`);
      }

      await connection.query<ResultSetHeader>(
        `UPDATE reports
        SET score = ?
        WHERE id = ?`,
        [dto.score, identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE report_confirmations
        SET score = ?,
            comment = ?
        WHERE id = ?`,
        [dto.score, dto.comment ?? null, confirmationId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getReportTrackByIdAfterMutation(id);
  }

  async rejectReport(
    id: number,
    dto: RejectReportDto,
  ): Promise<PublicReportTrack> {
    validateRejectReportDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findReportIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Report ${id} not found`);
      }

      if (identity.status !== 'waiting_confirm') {
        throw new BadRequestException(
          'report is not waiting for customer confirmation',
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO report_confirmations (
          report_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'reopened', ?, NULL)`,
        [identity.id, identity.customer_id, dto.reason],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE reports
        SET status = 'assigned',
            closed_at = NULL
        WHERE id = ?`,
        [identity.id],
      );

      const [ticketRows] = await connection.query<
        Array<RowDataPacket & { id: number; status: string }>
      >(
        `SELECT id, status
        FROM tickets
        WHERE report_id = ?
          AND status IN ('resolved', 'waiting_confirm')`,
        [identity.id],
      );

      if (ticketRows.length > 0) {
        await connection.query<ResultSetHeader>(
          `UPDATE tickets
          SET status = 'assigned',
              closed_at = NULL
          WHERE report_id = ?
            AND status IN ('resolved', 'waiting_confirm')`,
          [identity.id],
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO report_status_logs (
          report_id,
          old_status,
          new_status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, ?, 'assigned', 'customer', ?, ?)`,
        [identity.id, identity.status, identity.customer_id, dto.reason],
      );

      for (const ticket of ticketRows) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'assigned', NULL, ?)`,
          [ticket.id, ticket.status, dto.reason],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getReportTrackByIdAfterMutation(id);
  }

  private async getReportTrackByIdAfterMutation(
    id: number,
  ): Promise<PublicReportTrack> {
    const updated = await this.findReportTrackRowById(id);

    if (!updated) {
      throw new NotFoundException(`Report ${id} not found after update`);
    }

    const [reportStatusLogs] = await this.db.query<StatusLogRow[]>(
      `SELECT new_status, created_at
      FROM report_status_logs
      WHERE report_id = ?
      ORDER BY created_at ASC, id ASC`,
      [updated.id],
    );

    return mapTrackResponse(updated, reportStatusLogs);
  }

  private async syncExpiredWaitingConfirmReports(): Promise<void> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [expiredRows] = await connection.query<ExpiredWaitingConfirmRow[]>(
        `SELECT
          r.id AS report_id,
          r.customer_id,
          r.status AS report_status,
          t.id AS ticket_id,
          t.status AS ticket_status,
          (
            SELECT rsl.created_at
            FROM report_status_logs rsl
            WHERE rsl.report_id = r.id
              AND rsl.new_status = 'waiting_confirm'
            ORDER BY rsl.id DESC
            LIMIT 1
          ) AS waiting_confirm_at
        FROM reports r
        INNER JOIN tickets t
          ON t.id = (
            SELECT t2.id
            FROM tickets t2
            WHERE t2.report_id = r.id
            ORDER BY t2.id DESC
            LIMIT 1
          )
        WHERE r.status = 'waiting_confirm'
          AND t.status = 'waiting_confirm'
          AND (
            SELECT rsl.created_at
            FROM report_status_logs rsl
            WHERE rsl.report_id = r.id
              AND rsl.new_status = 'waiting_confirm'
            ORDER BY rsl.id DESC
            LIMIT 1
          ) IS NOT NULL
          AND DATE_ADD(
            (
              SELECT rsl.created_at
              FROM report_status_logs rsl
              WHERE rsl.report_id = r.id
                AND rsl.new_status = 'waiting_confirm'
              ORDER BY rsl.id DESC
              LIMIT 1
            ),
            INTERVAL 3 DAY
          ) < NOW()`,
      );

      for (const row of expiredRows) {
        await connection.query<ResultSetHeader>(
          `UPDATE reports
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = ?`,
          [row.report_id],
        );

        await connection.query<ResultSetHeader>(
          `UPDATE tickets
          SET status = 'closed',
              closed_at = NOW()
          WHERE id = ?`,
          [row.ticket_id],
        );

        await connection.query<ResultSetHeader>(
          `INSERT INTO report_status_logs (
            report_id,
            old_status,
            new_status,
            changed_by_type,
            changed_by_id,
            note
          ) VALUES (?, ?, 'closed', 'system', NULL, ?)`,
          [row.report_id, row.report_status, AUTO_CLOSE_NOTE],
        );

        await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_status_logs (
            ticket_id,
            old_status,
            new_status,
            changed_by,
            note
          ) VALUES (?, ?, 'closed', NULL, ?)`,
          [row.ticket_id, row.ticket_status, AUTO_CLOSE_NOTE],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async findReportTrackRowByReportNo(
    reportNo: string,
  ): Promise<ReportTrackRow | null> {
    const [rows] = await this.db.query<ReportTrackRow[]>(
      `SELECT
        r.id,
        r.report_no,
        r.title,
        r.detail,
        r.score,
        r.customer_id,
        r.status AS report_status,
        r.created_at AS report_created_at,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM reports r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN tickets t
        ON t.id = (
          SELECT t2.id
          FROM tickets t2
          WHERE t2.report_id = r.id
          ORDER BY t2.id DESC
          LIMIT 1
        )
      LEFT JOIN ticket_resolution_requests trr
        ON trr.id = (
          SELECT trr2.id
          FROM ticket_resolution_requests trr2
          WHERE trr2.ticket_id = t.id
          ORDER BY trr2.id DESC
          LIMIT 1
        )
      LEFT JOIN staffs staff
        ON staff.id = COALESCE(t.assigned_staff_id, trr.requested_by)
      WHERE r.report_no = ?
        AND pt.report_type = 'issue'
      LIMIT 1`,
      [reportNo],
    );

    return rows[0] ?? null;
  }

  private async findReportTrackRowById(
    id: number,
  ): Promise<ReportTrackRow | null> {
    const [rows] = await this.db.query<ReportTrackRow[]>(
      `SELECT
        r.id,
        r.report_no,
        r.title,
        r.detail,
        r.score,
        r.customer_id,
        r.status AS report_status,
        r.created_at AS report_created_at,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM reports r
      INNER JOIN problem_types pt
        ON pt.id = r.problem_type_id
      LEFT JOIN tickets t
        ON t.id = (
          SELECT t2.id
          FROM tickets t2
          WHERE t2.report_id = r.id
          ORDER BY t2.id DESC
          LIMIT 1
        )
      LEFT JOIN ticket_resolution_requests trr
        ON trr.id = (
          SELECT trr2.id
          FROM ticket_resolution_requests trr2
          WHERE trr2.ticket_id = t.id
          ORDER BY trr2.id DESC
          LIMIT 1
        )
      LEFT JOIN staffs staff
        ON staff.id = COALESCE(t.assigned_staff_id, trr.requested_by)
      WHERE r.id = ?
        AND pt.report_type = 'issue'
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  private async findReportIdentityById(
    connection: PoolConnection,
    id: number,
  ): Promise<ReportIdentityRow | null> {
    const [rows] = await connection.query<ReportIdentityRow[]>(
      `SELECT reports.id, reports.report_no, reports.customer_id, reports.status
      FROM reports
      INNER JOIN problem_types pt
        ON pt.id = reports.problem_type_id
      WHERE reports.id = ?
        AND pt.report_type = 'issue'
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
