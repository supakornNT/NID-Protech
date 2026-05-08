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
import { ConfirmReportDto } from './dto/confirm-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';
import { DashboardSummary } from './interfaces/dashboard-summary.interface';
import {
  GetReportsQuery,
  PublicReportList,
} from './interfaces/public-report-list.interface';
import {
  PublicReportTrack,
  PublicReportTrackTimeline,
} from './interfaces/public-report-track.interface';

interface DashboardSummaryRow extends RowDataPacket {
  total: number;
  screening: number;
  in_progress: number;
  completed: number;
}

interface PublicReportRow extends RowDataPacket {
  report_no: string;
  system_name: string | null;
  resolve_due_at: Date | string | null;
  status: string;
}

interface TotalCountRow extends RowDataPacket {
  total: number;
}

interface ReportTrackRow extends RowDataPacket {
  id: number;
  report_no: string;
  title: string;
  detail: string;
  score: number | null;
  customer_id: number;
  report_status: string;
  report_created_at: Date | string;
  ticket_id: number | null;
  ticket_status: string | null;
  assigned_staff_id: number | null;
  resolution_request_id: number | null;
  resolution_request_status: string | null;
  resolution_summary: string | null;
  reviewed_at: Date | string | null;
  repaired_by_name: string | null;
  repaired_by_surname: string | null;
}

interface StatusLogRow extends RowDataPacket {
  new_status: string;
  created_at: Date | string;
}

interface TicketStatusRow extends RowDataPacket {
  id: number;
  status: string;
}

interface ReportIdentityRow extends RowDataPacket {
  id: number;
  report_no: string;
  customer_id: number;
  status: string;
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: 'ฉบับร่าง',
  submitted: 'รับเรื่องแล้ว',
  screening: 'รอตรวจสอบ',
  assigned: 'รอดำเนินการ',
  in_progress: 'รอดำเนินการ',
  waiting_confirm: 'รอตรวจสอบโดยลูกค้า',
  closed: 'เสร็จสิ้น',
  rejected: 'ถูกปฏิเสธ',
};

const REPORT_STATUS_VALUES = new Set([
  'draft',
  'submitted',
  'screening',
  'assigned',
  'in_progress',
  'waiting_confirm',
  'closed',
  'rejected',
]);

@Injectable()
export class UserPortalService {
  constructor(
    @Inject('DB')
    private readonly db: Pool,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [rows] = await this.db.query<DashboardSummaryRow[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'screening' THEN 1 ELSE 0 END) AS screening,
        SUM(CASE WHEN status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS completed
      FROM reports`,
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
    const page = this.parsePositiveInteger(query.page, 1, 'page');
    const limit = Math.min(
      this.parsePositiveInteger(query.limit, 10, 'limit'),
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
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await this.db.query<TotalCountRow[]>(
      `SELECT COUNT(*) AS total
      FROM reports r
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
        r.resolve_due_at,
        r.status
      FROM reports r
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
        dueDate: this.formatDateOnly(row.resolve_due_at),
        document: `tracking-${row.report_no}.pdf`,
        status: this.mapReportStatusLabel(row.status),
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

    return this.mapTrackResponse(report, reportStatusLogs);
  }

  async confirmReport(
    id: number,
    dto: ConfirmReportDto,
  ): Promise<PublicReportTrack> {
    this.validateConfirmReportDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findReportIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Report ${id} not found`);
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO report_confirmations (
          report_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'confirmed', ?, ?)`,
        [identity.id, identity.customer_id, dto.comment ?? null, dto.score],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE reports
        SET status = 'closed',
            score = ?,
            closed_at = NOW()
        WHERE id = ?`,
        [dto.score, identity.id],
      );

      const [ticketRows] = await connection.query<TicketStatusRow[]>(
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

    return this.mapTrackResponse(updated, reportStatusLogs);
  }

  async rejectReport(
    id: number,
    dto: RejectReportDto,
  ): Promise<PublicReportTrack> {
    this.validateRejectReportDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.findReportIdentityById(connection, id);

      if (!identity) {
        throw new NotFoundException(`Report ${id} not found`);
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

      const [ticketRows] = await connection.query<TicketStatusRow[]>(
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

    return this.mapTrackResponse(updated, reportStatusLogs);
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
        t.id AS ticket_id,
        t.status AS ticket_status,
        t.assigned_staff_id,
        trr.id AS resolution_request_id,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM reports r
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
        t.id AS ticket_id,
        t.status AS ticket_status,
        t.assigned_staff_id,
        trr.id AS resolution_request_id,
        trr.status AS resolution_request_status,
        trr.summary AS resolution_summary,
        trr.reviewed_at,
        staff.name AS repaired_by_name,
        staff.surname AS repaired_by_surname
      FROM reports r
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
      `SELECT id, report_no, customer_id, status
      FROM reports
      WHERE id = ?
      LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  private mapTrackResponse(
    report: ReportTrackRow,
    reportStatusLogs: StatusLogRow[],
  ): PublicReportTrack {
    const currentStep = this.getCurrentStep(report.report_status);
    const firstInProgressLog = reportStatusLogs.find(
      (log) =>
        log.new_status === 'assigned' || log.new_status === 'in_progress',
    );
    const waitingConfirmLog = reportStatusLogs.find(
      (log) => log.new_status === 'waiting_confirm',
    );
    const screeningLog = reportStatusLogs.find(
      (log) => log.new_status === 'screening',
    );

    const reportedAt = this.toDateTimeParts(report.report_created_at);
    const screeningAt = this.toDateTimeParts(screeningLog?.created_at);
    const inProgressAt = this.toDateTimeParts(firstInProgressLog?.created_at);
    const waitingConfirmAt = this.toDateTimeParts(
      waitingConfirmLog?.created_at,
    );

    const timeline: PublicReportTrackTimeline[] = [
      {
        label: 'แจ้งปัญหา',
        status: this.getTimelineStatus(1, currentStep, report.report_status),
        date: reportedAt.date,
        time: reportedAt.time,
      },
      {
        label: 'คัดกรอง',
        status: this.getTimelineStatus(2, currentStep, report.report_status),
        date: screeningAt.date,
        time: screeningAt.time,
      },
      {
        label: 'ดำเนินการ',
        status: this.getTimelineStatus(3, currentStep, report.report_status),
        date: inProgressAt.date,
        time: inProgressAt.time,
      },
      {
        label: 'รอตรวจสอบโดยลูกค้า',
        status: this.getTimelineStatus(4, currentStep, report.report_status),
        date: waitingConfirmAt.date,
        time: waitingConfirmAt.time,
      },
    ];

    return {
      id: report.id,
      trackingNo: report.report_no,
      problem: report.title,
      status: this.mapReportStatusLabel(report.report_status),
      repairStatus: this.mapRepairStatus(
        report.report_status,
        report.resolution_request_status,
      ),
      repairedBy: this.getStaffFullName(
        report.repaired_by_name,
        report.repaired_by_surname,
      ),
      resolutionRequestId: report.resolution_request_id,
      ratingStatus: report.score === null ? 'ยังไม่ประเมิน' : 'ประเมินแล้ว',
      timeline,
      solution: report.resolution_summary ?? report.detail,
      repairedAt: this.formatDateTime(report.reviewed_at),
    };
  }

  private mapReportStatusLabel(status: string): string {
    return REPORT_STATUS_LABELS[status] ?? status;
  }

  private validateConfirmReportDto(dto: ConfirmReportDto): void {
    if (!Number.isInteger(dto.score) || dto.score < 1 || dto.score > 5) {
      throw new BadRequestException('score must be an integer between 1 and 5');
    }

    if (dto.comment !== undefined && typeof dto.comment !== 'string') {
      throw new BadRequestException('comment must be a string');
    }
  }

  private validateRejectReportDto(dto: RejectReportDto): void {
    if (typeof dto.reason !== 'string' || dto.reason.trim().length === 0) {
      throw new BadRequestException('reason is required');
    }
  }

  private parsePositiveInteger(
    value: string | undefined,
    fallback: number,
    fieldName: string,
  ): number {
    if (!value) {
      return fallback;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }

    return parsedValue;
  }

  private mapRepairStatus(
    reportStatus: string,
    resolutionRequestStatus: string | null,
  ): string {
    if (
      reportStatus === 'waiting_confirm' &&
      resolutionRequestStatus === 'approved'
    ) {
      return 'หัวหน้าอนุมัติผลการแก้ไขแล้ว รอลูกค้ายืนยัน';
    }

    if (reportStatus === 'waiting_confirm') {
      return 'ส่งผลการแก้ไขแล้ว รอลูกค้ายืนยัน';
    }

    if (reportStatus === 'closed') {
      return 'ลูกค้ายืนยันปิดงานแล้ว';
    }

    if (reportStatus === 'assigned' || reportStatus === 'in_progress') {
      return 'เจ้าหน้าที่กำลังดำเนินการแก้ไข';
    }

    if (reportStatus === 'screening') {
      return 'เจ้าหน้าที่กำลังคัดกรองปัญหา';
    }

    if (reportStatus === 'rejected') {
      return 'รายการถูกปฏิเสธ';
    }

    return 'รับเรื่องแล้ว';
  }

  private getCurrentStep(reportStatus: string): number {
    if (reportStatus === 'screening') {
      return 2;
    }

    if (reportStatus === 'assigned' || reportStatus === 'in_progress') {
      return 3;
    }

    return 4;
  }

  private getTimelineStatus(
    stepNumber: number,
    currentStep: number,
    reportStatus: string,
  ): 'completed' | 'active' | 'pending' {
    if (reportStatus === 'closed') {
      return 'completed';
    }

    if (stepNumber < currentStep) {
      return 'completed';
    }

    if (stepNumber === currentStep) {
      return 'active';
    }

    return 'pending';
  }

  private getStaffFullName(
    name: string | null,
    surname: string | null,
  ): string {
    const fullName = [name, surname]
      .filter((value): value is string => Boolean(value))
      .join(' ');

    return fullName || '-';
  }

  private formatDateOnly(value: Date | string | null): string | null {
    if (!value) {
      return null;
    }

    return this.toIsoDate(value);
  }

  private formatDateTime(value: Date | string | null): string | null {
    if (!value) {
      return null;
    }

    const date = this.normalizeDate(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  private toDateTimeParts(value?: Date | string | null): {
    date?: string;
    time?: string;
  } {
    if (!value) {
      return {};
    }

    const date = this.normalizeDate(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  }

  private toIsoDate(value: Date | string): string {
    const date = this.normalizeDate(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private normalizeDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }
}
