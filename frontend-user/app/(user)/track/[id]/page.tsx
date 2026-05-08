"use client";

import * as React from "react";

import {
  ClipboardPlus,
  FileWarning,
  Info,
  Wrench,
} from "lucide-react";

import StepProgress from "@/components/trackstep/StepProgress";

import {
  Props,
  RepairDetail,
  TrackingDetail,
} from "@/types/tracking";

import RatingModal from "@/components/trackstep/popup/RatingModal";
import RepairDetailModal from "@/components/trackstep/popup/RepairDetailModal";
import ConfirmCloseModal from "@/components/trackstep/popup/ConfirmCloseModal";
import RejectWorkModal from "@/components/trackstep/popup/RejectWorkModal";

import { ProTechButton } from "@/components/tables/protech-button";

interface TrackingTimelineApiItem {
  label: string;
  status: "completed" | "active" | "pending";
  date?: string;
  time?: string;
}

interface TrackingDetailApiResponse {
  id: number;
  trackingNo: string;
  problem: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  resolutionRequestId: number | null;
  ratingStatus: string;
  timeline: TrackingTimelineApiItem[];
  solution: string;
  repairedAt: string | null;
}

type TrackingDetailView = TrackingDetail & {
  repairedAt?: string | null;
};

function buildApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapTrackingDetail(
  data: TrackingDetailApiResponse,
): TrackingDetailView {
  return {
    id: data.id,
    trackingNo: data.trackingNo,
    problem: data.problem,
    status: data.status,
    repairStatus: data.repairStatus,
    repairedBy: data.repairedBy,
    resolutionRequestId:
      data.resolutionRequestId ?? undefined,
    ratingStatus: data.ratingStatus,
    timeline: data.timeline.map((item) => ({
      label: item.label,
      date: item.date,
      time: item.time,
    })),
    solution: data.solution,
    repairedAt: data.repairedAt,
  };
}

function getActiveStep(
  status: string,
): number {
  if (status === "รอตรวจสอบ") {
    return 2;
  }

  if (status === "รอดำเนินการ") {
    return 3;
  }

  return 4;
}

function buildRepairDetail(
  ticket: TrackingDetailView,
): RepairDetail {
  return {
    description:
      ticket.solution ?? "-",
    repairedAt:
      ticket.repairedAt ?? "-",
    files: [],
  };
}

export default function Page({ params }: Props) {
  const { id } = React.use(params);

  const [countdown, setCountdown] = React.useState("");
  const [ticket, setTicket] =
    React.useState<TrackingDetailView | null>(null);
  const [loading, setLoading] =
    React.useState(true);
  const [error, setError] =
    React.useState<string | null>(null);

  const [showRepairDetail, setShowRepairDetail] = React.useState(false);
  const [showRating, setShowRating] = React.useState(false);
  const [showConfirmClose, setShowConfirmClose] = React.useState(false);
  const [showRejectWork, setShowRejectWork] = React.useState(false);

  const [rejectReason, setRejectReason] = React.useState("");

  const [repairDetail, setRepairDetail] = React.useState<RepairDetail | null>(
    null,
  );

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (ticket?.status !== "รอตรวจสอบโดยลูกค้า") return;

    const deadline = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setCountdown("หมดเวลา");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วิ`);
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket?.status]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await fetchJson<TrackingDetailApiResponse>(
            `/user/reports/track/${encodeURIComponent(id)}`,
            {
              signal: controller.signal,
            },
          );

        setTicket(
          mapTrackingDetail(result),
        );
      } catch (loadError) {
        if (
          loadError instanceof Error &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load tracking detail",
        );
        setTicket(null);
      } finally {
        setLoading(false);
      }
    }

    void loadData();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <div className="p-6">กำลังโหลด...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="p-6 text-red-600">
        {error ?? "ไม่พบข้อมูล"}
      </div>
    );
  }

  const activeStep = getActiveStep(
    ticket.status,
  );

  async function fetchRepairDetail() {
    const currentTicket = ticket;

    if (!currentTicket) {
      return;
    }

    setRepairDetail(
      buildRepairDetail(currentTicket),
    );
    setShowRepairDetail(true);
  }

  function handleConfirmDone() {
    setShowConfirmClose(false);
    setShowRating(true);
  }

  async function handleRejectWork() {
    if (!ticket) return;

    try {
      setSubmitting(true);
      setError(null);

      const result =
        await fetchJson<TrackingDetailApiResponse>(
          `/user/reports/${ticket.id}/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              reason: rejectReason,
            }),
          },
        );

      setTicket(
        mapTrackingDetail(result),
      );
      setShowRejectWork(false);
      setRejectReason("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to reject report",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRating(payload: {
    rating: number;
    comment: string;
  }) {
    if (!ticket) return;

    try {
      setSubmitting(true);
      setError(null);

      const result =
        await fetchJson<TrackingDetailApiResponse>(
          `/user/reports/${ticket.id}/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              score: payload.rating,
              comment: payload.comment,
            }),
          },
        );

      setTicket(
        mapTrackingDetail(result),
      );
      setShowRating(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to confirm report",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-6 sm:py-10">
        {error ? (
          <p className="mb-4 self-stretch text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <StepProgress
          steps={ticket.timeline}
          activeStep={activeStep}
          isCompleted={ticket.status === "เสร็จสิ้น"}
        />

        <section className="mt-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#2F66C5] bg-white shadow-sm sm:mt-16">
          <div className="flex flex-col gap-4 bg-[#A9CCFF] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#2F66C5] bg-[#DCE9FF]">
                <ClipboardPlus className="text-[#2F66C5]" />
              </div>

              <div>
                <p className="font-semibold text-[#20498F]">{ticket.status}</p>

                <p className="text-xs text-[#315FAF]">
                  ระบบติดตามการดำเนินงาน
                </p>
              </div>
            </div>

            {ticket.status === "รอตรวจสอบโดยลูกค้า" && (
              <p className="text-[14px] font-medium text-[#315FAF] sm:text-[15px]">
                เหลือ {countdown}
              </p>
            )}
          </div>

          <div className="px-4 py-5 sm:px-8">
            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FileWarning size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">ปัญหาที่พบ</p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {ticket.problem}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Info size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">
                  สถานะการดำเนินงาน
                </p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {ticket.repairStatus}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Wrench size={22} className="shrink-0 text-gray-500" />
                <p className="text-[14px] sm:text-[15px]">ดำเนินการโดย</p>
              </div>

              <p className="text-[14px] text-gray-700 sm:text-[15px] sm:text-right">
                {ticket.repairedBy}
              </p>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Info size={22} className="shrink-0 text-gray-500" />

                  <p className="text-[14px] sm:text-[15px]">วิธีการแก้ไข</p>
                </div>

                <ProTechButton onClick={fetchRepairDetail} variant="detail">
                  รายละเอียด
                </ProTechButton>
              </div>
            </div>

            {ticket.status === "รอตรวจสอบโดยลูกค้า" && (
              <div className="flex justify-end gap-3 py-4">
                <ProTechButton
                  onClick={() => setShowRejectWork(true)}
                  variant="outline"
                >
                  ไม่อนุมัติ
                </ProTechButton>

                <ProTechButton
                  onClick={() => setShowConfirmClose(true)}
                  variant="primary"
                >
                  อนุมัติ
                </ProTechButton>
              </div>
            )}

            {ticket.status === "เสร็จสิ้น" &&
              ticket.ratingStatus !== "ประเมินแล้ว" && (
                <div className="flex justify-end py-4">
                  <ProTechButton onClick={() => setShowRating(true)}>
                    ประเมิน
                  </ProTechButton>
                </div>
              )}
          </div>
        </section>
      </div>

      <ConfirmCloseModal
        open={showConfirmClose}
        title="ยืนยันปิดงาน"
        description="คุณต้องการยืนยันปิดงานใช่หรือไม่"
        subDescription="หลังจากยืนยันแล้ว ระบบจะถือว่างานเสร็จสมบูรณ์"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        onClose={() => setShowConfirmClose(false)}
        onConfirm={handleConfirmDone}
      />

      <RejectWorkModal
        open={showRejectWork}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => {
          setShowRejectWork(false);
          setRejectReason("");
        }}
        onConfirm={() => {
          void handleRejectWork();
        }}
      />

      <RepairDetailModal
        open={showRepairDetail}
        data={repairDetail}
        onClose={() => setShowRepairDetail(false)}
      />

      <RatingModal
        open={showRating}
        loading={submitting}
        onClose={() => setShowRating(false)}
        onSubmit={submitRating}
      />
    </>
  );
}
