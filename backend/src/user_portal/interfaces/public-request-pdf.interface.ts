export interface PublicRequestPdfData {
  trackingNo: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  systemName: string | null;
  problemTypeName: string | null;
  problemTitle: string;
  problemDetail: string;
  statusCode: string;
  issuedAt: string;
  documentFileName: string;
  documentGeneratedAt: string | null;
}
