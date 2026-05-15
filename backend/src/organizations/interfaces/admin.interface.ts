import { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';
import { RowDataPacket } from 'mysql2';

export interface AdminOrganization extends RowDataPacket {
  id: number;
  organizationName: string | null;
  email: string;
  phone: string;
  organizationType: string;
  status: string;
  updatedAt: Date | null;
}

export interface PublicAdminOrganizationList {
  items: AdminOrganization[];
  pagination: PaginationMeta;
}
export interface OrganizationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  type?: string;
}
