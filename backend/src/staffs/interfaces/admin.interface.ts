import type { RowDataPacket } from 'mysql2/promise';

export type AdminUserType = 'staff' | 'customer';

export type AdminStaffStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected';

export type GetAdminStaffsQuery = {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: AdminStaffStatus | string;
  userType?: AdminUserType | string;
};

export interface AdminStaffListRow extends RowDataPacket {
  userType: string;
  id: number;
  prefixId: number | null;
  prefixName: string | null;
  name: string;
  surname: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  citizenId: string | null;
  status: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  lastPasswordChangedAt: Date | string | null;
  customerType: string | null;
  organizationName: string | null;
  roleNames: string | null;
  teamNames: string | null;
}

export type AdminStaffListItem = {
  userType: 'staff' | 'customer';
  id: number;
  prefixId: number | null;
  prefixName: string | null;
  name: string;
  surname: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  citizenId: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastPasswordChangedAt: string | null;
  customerType: string | null;
  organizationName: string | null;
  roleNames: string[];
  teamNames: string[];
};

export type AdminStaffListResponse = {
  items: AdminStaffListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface PrefixOptionRow extends RowDataPacket {
  value: number;
  label: string;
}

export interface RoleOptionRow extends RowDataPacket {
  value: number;
  label: string;
}

export type AdminStaffOptionsResponse = {
  prefixes: Array<{
    value: number;
    label: string;
  }>;
  roles: Array<{
    value: number;
    label: string;
  }>;
};
