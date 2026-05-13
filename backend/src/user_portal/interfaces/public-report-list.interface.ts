import { PublicRequest } from './public-report.interface';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PublicRequestList {
  items: PublicRequest[];
  pagination: PaginationMeta;
}

export interface GetRequestsQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}
