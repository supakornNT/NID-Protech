import { PublicReport } from './public-report.interface';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PublicReportList {
  items: PublicReport[];
  pagination: PaginationMeta;
}

export interface GetReportsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}
