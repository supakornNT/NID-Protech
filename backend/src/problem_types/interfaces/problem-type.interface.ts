import type { RowDataPacket } from 'mysql2/promise';
import { PaginationMeta } from '@/user_portal/interfaces/public-request-list.interface';

export interface ProblemType extends RowDataPacket {
  id: number;
  code: string | null;
  name: string;
  requestType: string;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProblemTypeCountRow extends RowDataPacket {
  total: number;
}

export interface PublicProblemTypeList {
  items: ProblemType[];
  pagination: PaginationMeta;
}
