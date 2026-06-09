export class MyWorkQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  system?: string;
  sort?: 'latest' | 'earliest';
}