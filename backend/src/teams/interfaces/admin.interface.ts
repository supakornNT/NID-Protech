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

export interface TeamMemberManagementQuery {
  page?: string;
  limit?: string;
  search?: string;
  teamId?: string;
  groupFilter?: string;
}

export interface TeamMemberManagementRow extends RowDataPacket {
  id: number;
  fullName: string;
  email: string;
  status: string;
  membershipIds: string | null;
  teamIds: string | null;
  teamNames: string | null;
}

export interface TeamMemberManagementMembership {
  id: number;
  teamId: number;
  teamName: string;
}

export interface TeamMemberManagementItem {
  id: number;
  fullName: string;
  email: string;
  status: string;
  teams: string[];
  teamIds: number[];
  memberships: TeamMemberManagementMembership[];
}

export interface TeamOptionRow extends RowDataPacket {
  value: number;
  label: string;
  status: string;
}

export interface TeamMemberOption {
  value: number;
  label: string;
  status: string;
}

export interface StaffOptionRow extends RowDataPacket {
  value: number;
  label: string;
}

export interface StaffOption {
  value: number;
  label: string;
}

export interface TeamMemberManagementResponse {
  items: TeamMemberManagementItem[];
  pagination: PaginationMeta;
  filterOptions: {
    teams: TeamMemberOption[];
    staffs: StaffOption[];
  };
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

export interface TeamPermissionSection {
  id: string;
  title: string;
  items: TeamPermissionItem[];
}

export interface TeamPermissionDetail {
  team: {
    id: number;
    name: string;
    status: string;
  };
  sections: TeamPermissionSection[];
}
