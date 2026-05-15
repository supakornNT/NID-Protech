import { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';
import { RowDataPacket } from 'mysql2';

export interface Adminteam extends RowDataPacket {
  id: number;
  name: string;
  status: string;
  updatedAt: Date | null;
}

export interface PublicAdminTeamList {
  items: Adminteam[];
  pagination: PaginationMeta;
}

export interface GetTeamsQuery {
  page?: string;
  limit?: string;
  search?: string;
}
