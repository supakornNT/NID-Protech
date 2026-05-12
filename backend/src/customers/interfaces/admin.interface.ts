import { PaginationMeta } from '@/user_portal/interfaces/public-report-list.interface';
import { RowDataPacket } from 'mysql2';

export interface AdminCustomer extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  customerType: string;
  organizationId: number | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PublicAdminCustomerList {
  items: AdminCustomer[];
  pagination: PaginationMeta;
}

export interface GetCustomersQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export interface CountRow extends RowDataPacket {
  total: number;
}
