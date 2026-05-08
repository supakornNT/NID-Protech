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
  status: string;
  repairStatus: string;
  repairedBy: string;
  resolutionRequestId: number | null;
  ratingStatus: string;
  timeline: PublicReportTrackTimeline[];
  solution: string;
  repairedAt: string | null;
}
