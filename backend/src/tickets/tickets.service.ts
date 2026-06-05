import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise';
import {
  findById,
  MyRequestItem,
  MyWorkItem,
  PendingCloseItem,
  TicketByRequest,
  WorkDetail,
} from './interfaces/ticket.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { SubmitTicketResolutionDto } from './dto/submit-ticket-resolution.dto';

@Injectable()
export class TicketsService {
  constructor(@Inject('DB') private readonly db: Pool) {}

  async findByStaff(staffId: number) {
    const [rows] = await this.db.query<TicketByRequest[]>(
      `SELECT
        tickets.id,
        tickets.title,
        requests.detail,
        tickets.resolved_at AS resolvedAt,
        tickets.due_at AS dueAt,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      WHERE tickets.assigned_staff_id = ?
        AND tickets.status NOT IN ('resolved', 'closed', 'cancelled') `,
      [staffId],
    );
    return rows;
  }

  async findAllByRequest(id: number) {
    const [rows] = await this.db.query<TicketByRequest[]>(
      `
      SELECT
        tickets.id,
        CONCAT(staffs.name,' ',staffs.surname) AS assignedStaffName,
        tickets.title,
        tickets.description,
        tickets.status,
        tickets.due_at AS dueAt,
        tickets.resolved_at AS resolvedAt,
        trr.reject_reason AS rejectReason
      FROM tickets
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      LEFT JOIN (
        SELECT latest.*
        FROM ticket_resolution_requests latest
        INNER JOIN (
          SELECT ticket_id, MAX(id) AS latest_id
          FROM ticket_resolution_requests
          GROUP BY ticket_id
        ) picked ON picked.latest_id = latest.id
      ) trr ON trr.ticket_id = tickets.id
      WHERE tickets.request_id = ? AND tickets.status IN ('assigned', 'resolved', 'closed')
      `,
      [id],
    );
    return rows;
  }

  async createSubTicket(dto: CreateTicketDto) {
    const ticketNo = `TK-${Date.now().toString().slice(-6)}`;
    const [result] = await this.db.query<ResultSetHeader>(
      `INSERT INTO tickets
        (ticket_no, request_id, assigned_staff_id, assigned_by, due_at, title, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketNo,
        dto.requestId,
        dto.assignedStaffId,
        dto.assignedBy,
        dto.dueAt,
        dto.title,
        dto.description,
        dto.status,
      ],
    );
    await this.db.query(
      `INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by, note)
       VALUES (?, NULL, ?, ?, ?)`,
      [
        result.insertId,
        dto.status ?? 'assigned',
        dto.assignedBy ?? null,
        'สร้าง ticket และมอบหมายงาน',
      ],
    );
    return {
      id: result.insertId,
      ticketNo: ticketNo,
      requestId: dto.requestId,
      assignedStaffId: dto.assignedStaffId,
      assignedBy: dto.assignedBy,
      dueAt: dto.dueAt,
      title: dto.title,
      description: dto.description,
      status: dto.status,
    };
  }

  async findById(id: number) {
    const [rows] = await this.db.query<findById[]>(
      `
      SELECT
        CONCAT(staffs.name,' ',staffs.surname) AS fullName,
        tickets.title,
        tickets.description,
        tickets.due_at AS dueAt
      FROM tickets
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      WHERE tickets.id = ?
      `,
      [id],
    );
    return rows[0];
  }

  async findWorkDetail(ticketId: number): Promise<WorkDetail | null> {
    const [rows] = await this.db.query<WorkDetail[]>(
      `SELECT
        tickets.id AS ticketId,
        tickets.request_id AS requestId,
        tickets.status AS ticketStatus,
        tickets.title AS ticketTitle,
        tickets.description AS ticketDescription,
        tickets.due_at AS dueAt,
        latest_trr.id AS resolutionRequestId,
        latest_trr.status AS resolutionRequestStatus,
        latest_trr.summary AS resolutionSummary,
        requests.request_no AS requestNo,
        requests.title,
        requests.detail,
        CONCAT(customers.name, ' ', customers.surname) AS customerName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType,
        (
          SELECT trr_reject.reject_reason
          FROM ticket_resolution_requests trr_reject
          WHERE trr_reject.ticket_id = tickets.id
            AND trr_reject.status = 'rejected'
            AND trr_reject.reject_reason IS NOT NULL
          ORDER BY trr_reject.id DESC
          LIMIT 1
        ) AS rejectNote
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN (
        SELECT latest.*
        FROM ticket_resolution_requests latest
        INNER JOIN (
          SELECT ticket_id, MAX(id) AS latest_id
          FROM ticket_resolution_requests
          GROUP BY ticket_id
        ) picked
          ON picked.latest_id = latest.id
      ) latest_trr ON latest_trr.ticket_id = tickets.id
      WHERE tickets.id = ?`,
      [ticketId],
    );
    return rows[0] ?? null;
  }

  async hideAttachment(attachmentId: number) {
    await this.db.query(`UPDATE attachments SET status = 'hide' WHERE id = ?`, [
      attachmentId,
    ]);
  }

  async updateSubTicket(id: number, dto: UpdateTicketDto) {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (dto.dueAt !== undefined) {
      sets.push('due_at = ?');
      params.push(dto.dueAt);
    }
    if (dto.title !== undefined) {
      sets.push('title = ?');
      params.push(dto.title);
    }
    if (dto.description !== undefined) {
      sets.push('description = ?');
      params.push(dto.description);
    }
    if (dto.status !== undefined) {
      sets.push('status = ?');
      params.push(dto.status);
    }
    if (dto.status === 'resolved') {
      sets.push('resolved_at = NOW()');
    }

    if (sets.length === 0) return;

    type TicketRow = {
      status: string;
      request_id: number;
    } & import('mysql2/promise').RowDataPacket;
    const [[current]] = await this.db.query<TicketRow[]>(
      'SELECT status, request_id FROM tickets WHERE id = ?',
      [id],
    );

    params.push(id);
    await this.db.query(
      `UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`,
      params,
    );

    if (dto.status !== undefined && current) {
      await this.db.query(
        `INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by, note)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          current.status,
          dto.status,
          dto.changedBy ?? null,
          dto.note ?? null,
        ],
      );

      if (dto.status === 'in_progress') {
        await this.db.query(
          `INSERT INTO request_status_logs (request_id, status, changed_by_type, changed_by_id, note)
           VALUES (?, 'in_progress', 'staff', ?, NULL)`,
          [current.request_id, dto.changedBy ?? null],
        );
      }
    }
  }

  async findMyWork(staffId: number): Promise<MyWorkItem[]> {
    const [rows] = await this.db.query<MyWorkItem[]>(
      `SELECT
        tickets.id,
        tickets.request_id AS requestId,
        tickets.title,
        tickets.status,
        tickets.due_at AS dueAt,
        CONCAT(customers.name, ' ', customers.surname) AS customerName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN (
        SELECT latest.*
        FROM ticket_resolution_requests latest
        INNER JOIN (
          SELECT ticket_id, MAX(id) AS latest_id
          FROM ticket_resolution_requests
          GROUP BY ticket_id
        ) picked
          ON picked.latest_id = latest.id
      ) latest_trr ON latest_trr.ticket_id = tickets.id
      WHERE tickets.assigned_staff_id = ?
        AND tickets.status NOT IN ('cancelled', 'resolved')
        AND COALESCE(latest_trr.status, '') != 'pending'
      ORDER BY tickets.created_at DESC`,
      [staffId],
    );
    return rows;
  }

  async submitResolution(
    ticketId: number,
    dto: SubmitTicketResolutionDto,
    files: Express.Multer.File[],
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      type TicketRow = {
        id: number;
        request_id: number;
        status: string;
      } & import('mysql2/promise').RowDataPacket;

      const [[ticket]] = await connection.query<TicketRow[]>(
        `SELECT id, request_id, status
         FROM tickets
         WHERE id = ?`,
        [ticketId],
      );

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      type ResolutionRow = {
        id: number;
        status: string;
      } & import('mysql2/promise').RowDataPacket;

      const [[latestResolution]] = await connection.query<ResolutionRow[]>(
        `SELECT id, status
         FROM ticket_resolution_requests
         WHERE ticket_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [ticketId],
      );

      let resolutionRequestId = latestResolution?.id ?? null;

      if (latestResolution?.status === 'pending') {
        await connection.query(
          `UPDATE ticket_resolution_requests
           SET requested_by = ?,
               summary = ?,
               reviewed_by = NULL,
               reviewed_at = NULL,
               reject_reason = NULL
           WHERE id = ?`,
          [dto.requestedBy, dto.summary, latestResolution.id],
        );
      } else {
        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO ticket_resolution_requests (
            ticket_id,
            requested_by,
            summary,
            status,
            reviewed_by,
            reviewed_at,
            reject_reason
          ) VALUES (?, ?, ?, 'pending', NULL, NULL, NULL)`,
          [ticketId, dto.requestedBy, dto.summary],
        );
        resolutionRequestId = result.insertId;
      }

      await connection.query(
        `UPDATE tickets
         SET status = 'in_progress'
         WHERE id = ?`,
        [ticketId],
      );

      await connection.query(
        `INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by, note)
         VALUES (?, ?, 'in_progress', ?, ?)`,
        [
          ticketId,
          ticket.status,
          dto.requestedBy,
          'ส่งผลการแก้ไขเพื่อรออนุมัติ',
        ],
      );

      for (const file of files) {
        const ext = file.originalname.split('.').pop() ?? '';
        await connection.query(
          `INSERT INTO attachments (
            request_id,
            ticket_id,
            attachment_type,
            original_name,
            saved_name,
            file_ext,
            status
          ) VALUES (?, ?, 'resolution_evidence', ?, ?, ?, 'show')`,
          [dto.requestId, ticketId, file.originalname, file.filename, ext],
        );
      }

      await connection.commit();
      return {
        success: true,
        resolutionRequestId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findTicketAttachments(ticketId: number) {
    type AttachmentRow = {
      id: number;
      originalName: string;
      savedName: string;
      fileExt: string;
    } & import('mysql2/promise').RowDataPacket;
    const [rows] = await this.db.query<AttachmentRow[]>(
      `SELECT id, original_name AS originalName, saved_name AS savedName, file_ext AS fileExt
       FROM attachments
       WHERE ticket_id = ? AND status = 'show'`,
      [ticketId],
    );
    return rows;
  }

  async hideTicketAttachments(ticketId: number) {
    await this.db.query(
      `UPDATE attachments SET status = 'hide' WHERE ticket_id = ?`,
      [ticketId],
    );
  }

  async uploadTicketAttachments(
    ticketId: number,
    requestId: number,
    files: Express.Multer.File[],
  ) {
    for (const file of files) {
      const ext = file.originalname.split('.').pop() ?? '';
      await this.db.query(
        `INSERT INTO attachments (request_id, ticket_id, attachment_type, original_name, saved_name, file_ext, status)
         VALUES (?, ?, 'resolution_evidence', ?, ?, ?, 'show')`,
        [requestId, ticketId, file.originalname, file.filename, ext],
      );
    }
    return { uploaded: files.length };
  }

  async deleteSubticket(id: number) {
    await this.db.query(
      `
      UPDATE tickets
      SET status = 'cancelled' WHERE id = ?
      `,
      [id],
    );
  }

  async findMyRequests(staffId: number): Promise<MyRequestItem[]> {
    const [rows] = await this.db.query<MyRequestItem[]>(
      `SELECT
        r.id AS requestId,
        MIN(t.id) AS ticketId,
        r.title,
        r.status AS requestStatus,
        r.due_at AS dueAt,
        CONCAT(c.name, ' ', c.surname) AS customerName,
        s.name AS systemName,
        pt.name AS problemName,
        pt.request_type AS requestType,
        CASE WHEN
          (SELECT COUNT(*) FROM tickets t2
           WHERE t2.request_id = r.id
             AND t2.status NOT IN ('waiting_confirm', 'resolved', 'closed', 'cancelled')) = 0
          AND
          (SELECT COUNT(*) FROM tickets t2
           WHERE t2.request_id = r.id AND t2.status != 'cancelled') > 0
        THEN 1 ELSE 0 END AS allResolved
      FROM requests r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN systems s ON s.id = r.system_id
      LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
      INNER JOIN tickets t ON t.request_id = r.id
        AND t.assigned_staff_id = ?
        AND t.status != 'cancelled'
      WHERE r.status NOT IN ('closed', 'screening', 'rejected')
      GROUP BY r.id
      ORDER BY r.created_at DESC`,
      [staffId],
    );
    return rows;
  }

  async findApprovalHistory(): Promise<PendingCloseItem[]> {
    const [rows] = await this.db.query<PendingCloseItem[]>(
      `SELECT
        tickets.id,
        tickets.request_id AS requestId,
        tickets.title,
        tickets.description AS resolution,
        tickets.resolved_at AS resolvedAt,
        tickets.due_at AS dueAt,
        CONCAT(staffs.name, ' ', staffs.surname) AS assignedStaffName,
        CONCAT(customers.name, ' ', customers.surname) AS customerName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      WHERE tickets.status IN ('waiting_confirm', 'closed')
      ORDER BY tickets.resolved_at DESC`,
    );
    return rows;
  }

  async findPendingClose(): Promise<PendingCloseItem[]> {
    const [rows] = await this.db.query<PendingCloseItem[]>(
      `SELECT
        tickets.id,
        tickets.request_id AS requestId,
        tickets.title,
        tickets.description AS resolution,
        tickets.resolved_at AS resolvedAt,
        tickets.due_at AS dueAt,
        CONCAT(staffs.name, ' ', staffs.surname) AS assignedStaffName,
        CONCAT(customers.name, ' ', customers.surname) AS customerName,
        systems.name AS systemName,
        problem_types.name AS problemName,
        problem_types.request_type AS requestType
      FROM tickets
      LEFT JOIN requests ON requests.id = tickets.request_id
      LEFT JOIN customers ON customers.id = requests.customer_id
      LEFT JOIN systems ON systems.id = requests.system_id
      LEFT JOIN problem_types ON problem_types.id = requests.problem_type_id
      LEFT JOIN staffs ON staffs.id = tickets.assigned_staff_id
      WHERE tickets.status = 'waiting_confirm'
      ORDER BY tickets.resolved_at DESC`,
    );
    return rows;
  }
}
