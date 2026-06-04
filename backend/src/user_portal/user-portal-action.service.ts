import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { ConfirmRequestDto } from "./dto/confirm-request.dto";
import { RateRequestDto } from "./dto/rate-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import type { PublicRequestTrack } from "./interfaces/public-request-track.interface";
import { UserPortalQueryService } from "./user-portal-query.service";
import { UserPortalRepository } from "./user-portal.repository";
import {
  validateConfirmRequestDto,
  validateRateRequestDto,
  validateRejectRequestDto,
} from "./validation/user-portal.validation";

@Injectable()
export class UserPortalActionService {
  constructor(
    @Inject("DB") private readonly db: Pool,
    private readonly repository: UserPortalRepository,
    private readonly queryService: UserPortalQueryService,
  ) {}

  async confirmRequest(
    id: number,
    dto: ConfirmRequestDto,
  ): Promise<PublicRequestTrack> {
    validateConfirmRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.repository.findRequestIdentityById(
        connection,
        id,
      );

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== "waiting_confirm") {
        throw new BadRequestException(
          "request is not waiting for customer confirmation",
        );
      }

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_confirmations (
          request_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'confirmed', ?, NULL)`,
        [identity.id, identity.customerId, dto.comment ?? null],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE requests
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
        WHERE request_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE tickets
        SET status = 'closed',
            closed_at = NOW()
        WHERE request_id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_status_logs (
          request_id,
          status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, 'closed', 'customer', ?, ?)`,
        [identity.id, identity.customerId, dto.comment ?? null],
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
            dto.comment ?? "Customer confirmed completion",
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

    return this.queryService.getRequestTrackById(id);
  }

  async rateRequest(
    id: number,
    dto: RateRequestDto,
  ): Promise<PublicRequestTrack> {
    validateRateRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.repository.findRequestIdentityById(
        connection,
        id,
      );

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== "closed") {
        throw new BadRequestException("request is not closed");
      }

      const [confirmationRows] = await connection.query<
        Array<RowDataPacket & { id: number }>
      >(
        `SELECT id
        FROM request_confirmations
        WHERE request_id = ?
          AND result = 'confirmed'
        ORDER BY id DESC
        LIMIT 1`,
        [identity.id],
      );

      const confirmationId = Number(confirmationRows[0]?.id ?? 0);

      if (confirmationId <= 0) {
        throw new NotFoundException(`Confirmation for request ${id} not found`);
      }

      await connection.query<ResultSetHeader>(
        `UPDATE requests
        SET score = ?
        WHERE id = ?`,
        [dto.score, identity.id],
      );

      await connection.query<ResultSetHeader>(
        `UPDATE request_confirmations
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

    return this.queryService.getRequestTrackById(id);
  }

  async rejectRequest(
    id: number,
    dto: RejectRequestDto,
    files: Express.Multer.File[],
  ): Promise<PublicRequestTrack> {
    validateRejectRequestDto(dto);

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const identity = await this.repository.findRequestIdentityById(
        connection,
        id,
      );

      if (!identity) {
        throw new NotFoundException(`Request ${id} not found`);
      }

      if (identity.status !== "waiting_confirm") {
        throw new BadRequestException(
          "request is not waiting for customer confirmation",
        );
      }

      const [confirmationResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO request_confirmations (
          request_id,
          customer_id,
          result,
          comment,
          score
        ) VALUES (?, ?, 'reopened', ?, NULL)`,
        [identity.id, identity.customerId, dto.reason],
      );

      const requestConfirmationId = confirmationResult.insertId;

      for (const file of files ?? []) {
        const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
        await connection.query<ResultSetHeader>(
          `INSERT INTO attachments (
            request_id,
            request_confirmation_id,
            attachment_type,
            original_name,
            saved_name,
            file_ext,
            status
          ) VALUES (?, ?, 'reopen_evidence', ?, ?, ?, 'show')`,
          [
            identity.id,
            requestConfirmationId,
            file.originalname,
            file.filename,
            ext,
          ],
        );
      }

      await connection.query<ResultSetHeader>(
        `UPDATE requests
        SET status = 'assigned',
            closed_at = NULL
        WHERE id = ?`,
        [identity.id],
      );

      await connection.query<ResultSetHeader>(
        `INSERT INTO request_status_logs (
          request_id,
          status,
          changed_by_type,
          changed_by_id,
          note
        ) VALUES (?, 'assigned', 'customer', ?, ?)`,
        [identity.id, identity.customerId, dto.reason],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.queryService.getRequestTrackById(id);
  }
}
