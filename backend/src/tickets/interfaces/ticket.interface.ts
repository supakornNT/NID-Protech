import type { RowDataPacket } from 'mysql2/promise';

export interface Ticket extends RowDataPacket {
  id: number;
  ticket_no: string;
  request_id: number;
  request_no: string;
  parent_ticket_id: number | null;
  assigned_note: string | null;
  due_at: Date | null;
  customer_confirm_due_at: Date | null;
  assigned_team_id: number;
  assigned_team_name: string;
  assigned_staff_id: number;
  assigned_staff_name: string;
  assigned_by: number;
  assigned_by_name: string;
  title: string;
  description: string;
  status: string;
  created_at: Date | null;
  resolved_at: Date | null;
  closed_at: Date | null;
}

export interface TicketByRequest extends RowDataPacket {
  id: number;
  assignedStaffName: string;
  title: string;
  description: string | null;
  status: string;
  dueAt: Date | null;
  resolvedAt: Date | null;
  problemName: string;
  requestType: string;
}

export interface SubTicket extends RowDataPacket {
  ticketNo: string;
  requestId: number;
  assignedTeamId: number;
  assignedStafId: number;
  assignedBy: number;
  dueAt: Date;
  assigedNote: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

export interface findById extends RowDataPacket {
  fullName: string;
  title: string;
  description: string;
  dueAt: Date;
}

export interface WorkDetail extends RowDataPacket {
  ticketId: number;
  requestId: number;
  ticketStatus: string;
  ticketTitle: string;
  ticketDescription: string | null;
  dueAt: Date | null;
  resolutionRequestId: number | null;
  resolutionRequestStatus: string | null;
  resolutionSummary: string | null;
  requestNo: string;
  title: string;
  detail: string;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
  rejectNote: string | null;
}

export interface MyWorkItem extends RowDataPacket {
  id: number;
  requestId: number;
  title: string;
  status: string;
  dueAt: Date | null;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
}

export interface MyRequestItem extends RowDataPacket {
  requestId: number;
  ticketId: number;
  title: string;
  requestStatus: string;
  dueAt: Date | null;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
  allResolved: number;
}

export interface PendingCloseItem extends RowDataPacket {
  id: number;
  requestId: number;
  title: string;
  resolvedAt: Date | null;
  dueAt: Date | null;
  assignedStaffName: string;
  customerName: string;
  systemName: string | null;
  problemName: string;
  requestType: string;
  resolution: string | null;
}
