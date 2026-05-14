import type { RowDataPacket } from 'mysql2/promise';

export interface RequestsScreening extends RowDataPacket {
  id: number;
  requestNo: string;
  systemName: string;
  problemTypeName: string;
  status: string;
  createdAt: Date;
}

export interface RequestsDetail extends RowDataPacket {
  id: number;
  customerName: string;
  organizationName: string;
  systemName: string;
  problemName: string;
  title: string;
  detail: string;
  closedAt: Date;
}
