export interface PublicReportTrackTimeline {
  label: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  time?: string;
}

export interface PublicReportTrack {
  id: number;
  trackingNo: string;
  problem: string;
  statusCode: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  ratingStatus: string;
  timeline: PublicReportTrackTimeline[];
  solution: string;
  repairedAt: string | null;
  customerConfirmDueAt: string | null;
}
