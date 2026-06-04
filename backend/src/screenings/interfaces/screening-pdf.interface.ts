import type { RowDataPacket } from 'mysql2/promise';

export interface ScreeningPdfDataRow extends RowDataPacket {
  requestId: number;
  requestNo: string;
  title: string;
  detail: string;
  organization: string | null;
  createdAt: Date;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  staffName: string;
  problemTypeName: string | null;
  systemName: string | null;
}

export interface ScreeningPdfData {
  requestId: number;
  requestNo: string;
  title: string;
  detail: string;
  organization: string | null;
  createdAt: Date;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  staffName: string;
  screenedAt: Date;
  problemTypeName: string | null;
  systemName: string | null;
}
