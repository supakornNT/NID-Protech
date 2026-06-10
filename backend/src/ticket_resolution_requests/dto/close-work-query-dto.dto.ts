export class CloseWorkQueryDto {
  status?: 'pending' | 'history';
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  system?: string;
  sort?: 'latest' | 'earliest';
}