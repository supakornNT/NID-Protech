import { PublicRequest } from './public-request.interface';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  customerId?: string;
}
