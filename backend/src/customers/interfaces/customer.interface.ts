import type { RowDataPacket } from 'mysql2/promise';

export interface Customer extends RowDataPacket {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  customer_type: string;
  status: string;
  created_at: Date | null;
  updated_at: Date | null;
}
