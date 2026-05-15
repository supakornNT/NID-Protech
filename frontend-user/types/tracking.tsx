export type TrackingRow = {
  trackingNo: string;
  system: string;
  problem: string;
  status: string;
};

export type Props = {
  params: Promise<{
    id: string;
  }>;
};

export type TicketStatus =
  | "รอคัดกรอง"
  | "รอดำเนินการ"
  | "รอตรวจสอบโดยลูกค้า"
  | "เสร็จสิ้น";

export type RatingStatus =
  | "ยังไม่ประเมิน"
  | "ประเมินแล้ว";

export type TrackingStep = {
  label: string;
  date?: string;
  time?: string;
};

export type TrackingDetail = {
  id: number;
  statusCode?: string;
  customerConfirmDueAt?: string | null;
  trackingNo: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  solution?: string;
  ratingStatus?: string;
  problem: string;
  timeline: {
    label: string;
    date?: string;
    time?: string;
  }[];
};

export type RepairFile = {
  id: number;
  name: string;
  type: "pdf" | "image";
  size: string;
  uploadedAt: string;
  url: string;
};

export type RepairDetail = {
  description: string;
  repairedAt: string;
  files: RepairFile[];
};

export type StepProgressProps = {
  steps: TrackingStep[];
  activeStep: number;
  isCompleted?: boolean;
};
