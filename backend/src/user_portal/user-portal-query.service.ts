import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { formatDateTime as formatDateTimeUtil } from "../common/utils/date-time.util";
import { parsePositiveInteger as parsePositiveIntegerUtil } from "../common/utils/number.util";
import { mapRequestStatusLabel as mapRequestStatusLabelUtil } from "../common/utils/request-status.util";
import type { DashboardSummary } from "./interfaces/dashboard-summary.interface";
import type {
  GetRequestsQuery,
  PublicRequestList,
} from "./interfaces/public-request-list.interface";
import type { PublicRequestPdfData } from "./interfaces/public-request-pdf.interface";
import type { PublicRequestTrack } from "./interfaces/public-request-track.interface";
import { mapTrackResponse } from "./mappers/request-track.mapper";
import { UserPortalMaintenanceService } from "./user-portal-maintenance.service";
import { UserPortalRepository } from "./user-portal.repository";

const REQUEST_STATUS_VALUES = new Set([
  "screening",
  "assigned",
  "in_progress",
  "waiting_confirm",
  "closed",
  "rejected",
]);

@Injectable()
export class UserPortalQueryService {
  constructor(
    private readonly maintenanceService: UserPortalMaintenanceService,
    private readonly repository: UserPortalRepository,
  ) {}

  async getDashboardSummary(customerId?: number): Promise<DashboardSummary> {
    await this.maintenanceService.ensureRecentSync();

    const summary = await this.repository.getDashboardSummaryRow(customerId);

    return {
      total: Number(summary?.total ?? 0),
      screening: Number(summary?.screening ?? 0),
      inProgress: Number(summary?.inProgress ?? 0),
      completed: Number(summary?.completed ?? 0),
    };
  }

  async getRequests(query: GetRequestsQuery): Promise<PublicRequestList> {
    await this.maintenanceService.ensureRecentSync();

    const page = parsePositiveIntegerUtil(query.page, 1, "page");
    const limit = Math.min(
      parsePositiveIntegerUtil(query.limit, 10, "limit"),
      100,
    );
    const search = query.search?.trim() ?? "";
    const status = query.status?.trim() ?? "";
    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    const customerId = query.customerId
      ? parsePositiveIntegerUtil(query.customerId, 0, "customerId")
      : null;
    if (customerId) {
      whereClauses.push("r.customer_id = ?");
      params.push(customerId);
    }

    if (search.length > 0) {
      const likeSearch = `%${search}%`;
      whereClauses.push(`(
        r.request_no LIKE ?
        OR r.title LIKE ?
        OR COALESCE(s.name, '') LIKE ?
        OR COALESCE(pt.name, '') LIKE ?
      )`);
      params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    if (status.length > 0) {
      if (!REQUEST_STATUS_VALUES.has(status)) {
        throw new BadRequestException("status is invalid");
      }

      whereClauses.push("r.status = ?");
      params.push(status);
    }

    const whereSql =
      whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";
    const total = await this.repository.countRequests(whereSql, params);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const rows = await this.repository.findRequests(
      whereSql,
      params,
      limit,
      offset,
    );

    return {
      items: rows.map((row) => ({
        id: row.id,
        trackingNo: row.requestNo,
        system: row.systemName ?? "-",
        problem: row.problemName ?? "-",
        document: `tracking-${row.requestNo}.pdf`,
        status: mapRequestStatusLabelUtil(row.status),
      })),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getRequestTrack(requestNo: string): Promise<PublicRequestTrack> {
    await this.maintenanceService.ensureRecentSync();
    return this.getRequestTrackByRequestNo(requestNo);
  }

  async getRequestTrackByRequestNo(
    requestNo: string,
  ): Promise<PublicRequestTrack> {
    const request =
      await this.repository.findRequestTrackRowByRequestNo(requestNo);

    if (!request) {
      throw new NotFoundException(`Request ${requestNo} not found`);
    }

    const requestStatusLogs = await this.repository.findRequestStatusLogs(
      request.id,
    );
    const track = mapTrackResponse(request, requestStatusLogs);
    track.reopenRounds = await this.buildReopenRounds(request.id);

    return track;
  }

  async getRequestTrackById(id: number): Promise<PublicRequestTrack> {
    const updated = await this.repository.findRequestTrackRowById(id);

    if (!updated) {
      throw new NotFoundException(`Request ${id} not found after update`);
    }

    const requestStatusLogs = await this.repository.findRequestStatusLogs(
      updated.id,
    );
    const track = mapTrackResponse(updated, requestStatusLogs);
    track.reopenRounds = await this.buildReopenRounds(updated.id);

    return track;
  }

  private async buildReopenRounds(requestId: number): Promise<any[]> {
    const confirmations = await this.repository.findReopenConfirmations(requestId);
    const attachments = await this.repository.findReopenAttachments(requestId);
    const resolutionAttachments = await this.repository.findResolutionAttachments(requestId);
    const waitingConfirmLogs = await this.repository.findRequestWaitingConfirmLogs(requestId);

    const sortedConfirmations = [...confirmations].sort((a, b) => a.id - b.id);
    const getTime = (date: any): number => (date ? new Date(date).getTime() : 0);

    const rounds = sortedConfirmations.map((conf, index) => {
      const roundNumber = index + 1;
      const tReopen = getTime(conf.reopenedAt);
      const tPrev = index === 0 ? 0 : getTime(sortedConfirmations[index - 1].reopenedAt);

      const staffFiles = resolutionAttachments
        .filter(
          (att) => getTime(att.uploadedAt) < tReopen && getTime(att.uploadedAt) >= tPrev
        )
        .map((att) => ({
          id: att.id,
          originalName: att.originalName,
          savedName: att.savedName,
          fileExt: att.fileExt,
        }));

      const staffSummaryLog = [...waitingConfirmLogs]
        .reverse()
        .find(
          (log) => getTime(log.createdAt) < tReopen && getTime(log.createdAt) >= tPrev
        );

      const roundFiles = attachments
        .filter((att) => att.requestConfirmationId === conf.id)
        .map((att) => ({
          id: att.id,
          originalName: att.originalName,
          savedName: att.savedName,
          fileExt: att.fileExt,
        }));

      return {
        roundNumber,
        requestConfirmationId: conf.id,
        reopenedAt: conf.reopenedAt,
        comment: conf.comment,
        files: roundFiles,
        staffSummary: staffSummaryLog?.note ?? null,
        staffRepairedAt: staffSummaryLog?.createdAt ?? null,
        staffFiles: staffFiles,
      };
    });

    return [...rounds].reverse();
  }

  async getLatestRepairAttachments(id: number) {
    await this.maintenanceService.ensureRecentSync();
    return this.repository.findLatestRepairAttachments(id);
  }

  async getRequestPdfData(requestNo: string): Promise<PublicRequestPdfData> {
    await this.maintenanceService.ensureRecentSync();

    const row = await this.repository.findRequestPdfRow(requestNo);

    return {
      trackingNo: row.requestNo,
      requesterName: [row.customerName, row.customerSurname]
        .filter(Boolean)
        .join(" "),
      requesterEmail: row.customerEmail,
      requesterPhone: row.customerPhone,
      systemName: row.systemName,
      problemTypeName: row.problemTypeName,
      problemTitle: row.title,
      problemDetail: row.detail,
      statusCode: row.requestStatus,
      issuedAt: formatDateTimeUtil(row.requestCreatedAt) ?? "",
      documentFileName: row.documentFileName ?? `tracking-${row.requestNo}.pdf`,
      documentGeneratedAt: formatDateTimeUtil(row.documentGeneratedAt),
    };
  }
}
