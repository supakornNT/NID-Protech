export interface PublicRequestPdfData {
  trackingNo: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string | null;
  systemName: string | null;
  problemTypeName: string | null;
  problemTitle: string;
  problemDetail: string;
  statusCode: string;
  issuedAt: string;
  dueDate: string | null;
  documentFileName: string;
  documentGeneratedAt: string | null;
}
