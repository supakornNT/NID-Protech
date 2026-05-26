import type { RowDataPacket } from 'mysql2';

export interface System extends RowDataPacket {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface SystemOption extends RowDataPacket {
  id: number;
  name: string;
}
