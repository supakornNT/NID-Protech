import type { RowDataPacket } from 'mysql2/promise';

export interface StaffTeamRole extends RowDataPacket {
  id: number;
  staff_id: number;
  staff_name: string;
  team_id: number;
  team_name: string;
  role_id: number | null;
  role_name: string | null;
  created_at: Date | null;
}
