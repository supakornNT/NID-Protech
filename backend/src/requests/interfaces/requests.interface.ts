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
  organizationName: string | null;
  systemName: string;
  problemName: string;
  title: string;
  detail: string;
  closedAt: Date | null;
}

export interface RequestsAssign extends RowDataPacket {
  id: number;
  systemName: string;
  title: string;
  customerName: string;
  customerSurname: string;
  screennerName: string;
  probleTypeName: string;
  probleName: string;
}
