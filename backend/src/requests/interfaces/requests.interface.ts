import type { RowDataPacket } from 'mysql2/promise';

export interface StepInfo {
  label: string;
  date: string;
  time: string;
}

export interface RequestTracking {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  customerName: string;
  systemName: string;
  problemName: string;
  dueAt: string | null;
  allResolved: number;
  wasRejected: number;
  steps: (StepInfo | null)[];
}

export interface RequestTrackingRow extends RowDataPacket {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  createdAt: Date | string;
  dueAt: Date | string | null;
  customerName: string;
  systemName: string;
  problemName: string;
  allResolved: number;
  wasRejected: number;
}

export interface RequestTrackingLogRow extends RowDataPacket {
  request_id: number;
  status: string;
  created_at: Date | string;
}

export interface RequestsScreening extends RowDataPacket {
  id: number;
  requestNo: string;
  problemName: string;
  systemName: string;
  requestTypeName: string;
  createdAt: Date;
}

export interface RequestsDetail extends RowDataPacket {
  id: number;
  requestNo: string;
  customerName: string;
  organizationName: string | null;
  systemName: string;
  problemName: string;
  title: string;
  detail: string;
  status: string;
  assignedStaffName: string | null;
  dueAt: string | null;
  closedAt: Date | null;
  resolvedAt: string | null;
  wasReopened: number;
  latestReopenComment: string | null;
}

export interface RequestsAssign extends RowDataPacket {
  id: number;
  requestNo: string;
  systemName: string;
  title: string;
  customerName: string;
  customerSurname: string;
  probleTypeName: string;
  problemName: string;
  wasRejected: number;
}
