export class ScreeningQueryDto {
  type?: "complaint" | "issue";
  page?: number;
  limit?: number;
  search?: string;
}