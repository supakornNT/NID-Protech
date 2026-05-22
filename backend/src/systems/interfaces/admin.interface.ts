import type { RowDataPacket } from 'mysql2';

import type { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';

export interface CountRow extends RowDataPacket {
  total: number;
}

export interface AdminSystem extends RowDataPacket {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PublicAdminSystemList {
  items: AdminSystem[];
  pagination: PaginationMeta;
}

export interface SystemQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}
