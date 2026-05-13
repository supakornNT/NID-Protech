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

function buildRepairDetail(request: TrackingDetailView): RepairDetail {
  return {
    description: request.solution ?? "-",
    repairedAt: request.repairedAt ?? "-",
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

export function useTrackingDetail(requestNo: string) {
  const [countdown, setCountdown] = React.useState("");
  const [request, setRequest] = React.useState<TrackingDetailView | null>(null);
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
          `/user/requests/track/${encodeURIComponent(requestNo)}`,
          {
            signal: controller.signal,
          },
        );

        setRequest(mapTrackingDetail(result));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load tracking detail",
        );
        setRequest(null);
      } finally {
        setLoading(false);
      }
    }

    void loadData();

    return () => controller.abort();
  }, [requestNo, refreshKey]);

  React.useEffect(() => {
    if (
      request?.statusCode !== "waiting_confirm" ||
      !request.customerConfirmDueAt
    ) {
      return;
    }

    const deadline = parseDateTime(request.customerConfirmDueAt);

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
  }, [request?.customerConfirmDueAt, request?.statusCode]);


  
  async function rejectRequest(reason: string) {
    if (!request) {
      return;
    }

    try {
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/requests/${request.id}/reject`,
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

      setRequest(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to reject request",
      );
    }
  }

  async function confirmRequest() {
    if (!request) {
      return;
    }

    try {
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/requests/${request.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      setRequest(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to confirm request",
      );
    }
  }

  async function rateRequest(payload: { rating: number; comment: string }) {
    if (!request) {
      return;
    }

    try {
      setRatingSubmitting(true);
      setError(null);

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/requests/${request.id}/rating`,
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

      setRequest(mapTrackingDetail(result));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to rate request",
      );
    } finally {
      setRatingSubmitting(false);
    }
  }

  return {
    request,
    loading,
    error,
    ratingSubmitting,
    countdown,
    activeStep: request ? getActiveStep(request.statusCode) : 4,
    buildRepairDetail,
    rejectRequest,
    confirmRequest,
    rateRequest,
  };
}
