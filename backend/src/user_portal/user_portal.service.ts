import { Injectable } from '@nestjs/common';
import { ConfirmRequestDto } from './dto/confirm-request.dto';
import { RateRequestDto } from './dto/rate-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import type { DashboardSummary } from './interfaces/dashboard-summary.interface';
import type {
  GetRequestsQuery,
  PublicRequestList,
} from './interfaces/public-request-list.interface';
import type { PublicRequestPdfData } from './interfaces/public-request-pdf.interface';
import type { PublicRequestTrack } from './interfaces/public-request-track.interface';
import { UserPortalActionService } from './user-portal-action.service';
import { UserPortalQueryService } from './user-portal-query.service';

@Injectable()
export class UserPortalService {
  constructor(
    private readonly queryService: UserPortalQueryService,
    private readonly actionService: UserPortalActionService,
  ) {}

  getDashboardSummary(customerId?: number): Promise<DashboardSummary> {
    return this.queryService.getDashboardSummary(customerId);
  }

  getRequests(query: GetRequestsQuery): Promise<PublicRequestList> {
    return this.queryService.getRequests(query);
  }

  getRequestPdfData(requestNo: string): Promise<PublicRequestPdfData> {
    return this.queryService.getRequestPdfData(requestNo);
  }

  getRequestTrack(requestNo: string): Promise<PublicRequestTrack> {
    return this.queryService.getRequestTrack(requestNo);
  }

  confirmRequest(
    id: number,
    dto: ConfirmRequestDto,
  ): Promise<PublicRequestTrack> {
    return this.actionService.confirmRequest(id, dto);
  }

  rateRequest(id: number, dto: RateRequestDto): Promise<PublicRequestTrack> {
    return this.actionService.rateRequest(id, dto);
  }

  rejectRequest(
    id: number,
    dto: RejectRequestDto,
  ): Promise<PublicRequestTrack> {
    return this.actionService.rejectRequest(id, dto);
  }
}
