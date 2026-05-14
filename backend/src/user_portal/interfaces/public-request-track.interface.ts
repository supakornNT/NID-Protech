export interface PublicRequestTrackTimeline {
  label: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  time?: string;
}

export interface PublicRequestTrack {
  id: number;
  trackingNo: string;
  problem: string;
  statusCode: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  ratingStatus: string;
  timeline: PublicRequestTrackTimeline[];
  solution: string;
  repairedAt: string | null;
  customerConfirmDueAt: string | null;
}
