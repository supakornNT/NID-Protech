import type { RowDataPacket } from 'mysql2/promise';

export interface RequestTrackRow extends RowDataPacket {
  id: number;
  requestNo: string;
  title: string;
  detail: string;
  score: number | null;
  customerId: number;
  requestStatus: string;
  requestCreatedAt: Date | string;
  resolutionRequestStatus: string | null;
  resolutionSummary: string | null;
  reviewedAt: Date | string | null;
  repairedByName: string | null;
  repairedBySurname: string | null;
}

export interface StatusLogRow extends RowDataPacket {
  status: string;
  created_at: Date | string;
}
