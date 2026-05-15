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

export interface TeamPermissionRow extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  createdAt: Date | null;
  assigned: number;
}

export interface PermissionIdRow extends RowDataPacket {
  id: number;
}

export interface TeamPermissionItem {
  id: number;
  code: string;
  name: string;
  assigned: boolean;
}

export interface TeamPermissionDetail {
  team: {
    id: number;
    name: string;
    status: string;
  };
  permissions: TeamPermissionItem[];
}
