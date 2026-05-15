import type { ReactNode } from "react";

export type ComplaintRow = {
  id: number;
  requestNo: string;
  systemName: string;
  requestTypeName: string;
  createdAt: string;
  status: string;
};