export class RequestAssignQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  system?: string;
  sort?: 'latest' | 'earliest' | 'due_soon';
}