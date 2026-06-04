export interface PublicRequestTrackTimeline {
  label: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  time?: string;
}

export interface ReopenRoundFile {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string | null;
}

export interface ReopenRound {
  roundNumber: number;
  requestConfirmationId: number;
  reopenedAt: string | null;
  comment: string | null;
  files: ReopenRoundFile[];
  staffFiles: ReopenRoundFile[];
}

export interface PublicRequestTrack {
  id: number;
  trackingNo: string;
  problem: string;
  problemDetail: string;
  statusCode: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  ratingStatus: string;
  timeline: PublicRequestTrackTimeline[];
  solution: string;
  repairedAt: string | null;
  customerConfirmDueAt: string | null;
  reopenRounds?: ReopenRound[];
}
