"use client";

import * as React from "react";

import { fetchJson } from "@/lib/api";
import { RepairDetail, TrackingDetail } from "@/types/tracking";

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
  statusCode: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  ratingStatus: string;
  timeline: TrackingTimelineApiItem[];
  solution: string;
  repairedAt: string | null;
  customerConfirmDueAt: string | null;
}

type TrackingDetailView = TrackingDetail & {
  repairedAt?: string | null;
};

function mapTrackingDetail(
  data: TrackingDetailApiResponse,
): TrackingDetailView {
  return {
    id: data.id,
    trackingNo: data.trackingNo,
    problem: data.problem,
    statusCode: data.statusCode,
    status: data.status,
    repairStatus: data.repairStatus,
    repairedBy: data.repairedBy,
    ratingStatus: data.ratingStatus,
    customerConfirmDueAt: data.customerConfirmDueAt,
    timeline: data.timeline.map((item) => ({
      label: item.label,
      date: item.date,
      time: item.time,
    })),
    solution: data.solution,
    repairedAt: data.repairedAt,
  };
}

function getActiveStep(statusCode: string | undefined): number {
  if (statusCode === "screening") {
    return 2;
  }

  if (statusCode === "rejected") {
    return 2;
  }

  if (statusCode === "assigned" || statusCode === "in_progress") {
    return 3;
  }

  return 4;
}

function buildRepairDetail(report: TrackingDetailView): RepairDetail {
  return {
    description: report.solution ?? "-",
    repairedAt: report.repairedAt ?? "-",
    files: [],
  };
}

function formatCountdown(diff: number): string {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days} วัน ${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
}

function parseDateTime(value: string): number {
  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");

  return new Date(normalizedValue).getTime();
}

export function useTrackingDetail(reportNo: string) {
  const [countdown, setCountdown] = React.useState("");
  const [report, setReport] = React.useState<TrackingDetailView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchJson<TrackingDetailApiResponse>(
          `/user/reports/track/${encodeURIComponent(reportNo)}`,
          {
            signal: controller.signal,
          },
        );

        setReport(mapTrackingDetail(result));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load tracking detail",
        );
        setReport(null);
      } finally {
        setLoading(false);
      }
    }

    void loadData();

    return () => controller.abort();
  }, [reportNo, refreshKey]);

  React.useEffect(() => {
    if (
      report?.statusCode !== "waiting_confirm" ||
      !report.customerConfirmDueAt
    ) {
      return;
    }

    const deadline = parseDateTime(report.customerConfirmDueAt);

    if (Number.isNaN(deadline)) {
      return;
    }

    function updateCountdown(): boolean {
      const diff = deadline - Date.now();

      if (diff <= 0) {
        setCountdown("หมดเวลา");
        setRefreshKey((current) => current + 1);
        return false;
      }

      setCountdown(formatCountdown(diff));
      return true;
    }

    updateCountdown();

    const timer = setInterval(() => {
      if (!updateCountdown()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [report?.customerConfirmDueAt, report?.statusCode]);


  
  async function rejectReport(reason: string) {
    if (!report) {
      return;
    }

    try {
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/reports/${report.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        },
      );

      setReport(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to reject report",
      );
    }
  }

  async function confirmReport() {
    if (!report) {
      return;
    }

    try {
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/reports/${report.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      setReport(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to confirm report",
      );
    }
  }

  async function rateReport(payload: { rating: number; comment: string }) {
    if (!report) {
      return;
    }

    try {
      setRatingSubmitting(true);
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/reports/${report.id}/rating`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: payload.rating,
            comment: payload.comment,
          }),
        },
      );

      setReport(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to rate report",
      );
    } finally {
      setRatingSubmitting(false);
    }
  }

  return {
    report,
    loading,
    error,
    ratingSubmitting,
    countdown,
    activeStep: report ? getActiveStep(report.statusCode) : 4,
    buildRepairDetail,
    rejectReport,
    confirmReport,
    rateReport,
  };
}
