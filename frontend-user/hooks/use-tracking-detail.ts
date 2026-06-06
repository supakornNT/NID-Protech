"use client";

import * as React from "react";

import { fetchJson } from "@/lib/fetch";
import { RepairDetail, RepairFile, TrackingDetail } from "@/types/tracking";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface TrackingTimelineApiItem {
  label: string;
  status: "completed" | "active" | "pending";
  date?: string;
  time?: string;
}

interface ReopenRoundApiItem {
  roundNumber: number;
  requestConfirmationId: number;
  reopenedAt: string | null;
  comment: string | null;
  files: AttachmentApiResponse[];
  staffSummary: string | null;
  staffFiles: AttachmentApiResponse[];
}

interface TrackingDetailApiResponse {
  id: number;
  trackingNo: string;
  problem: string;
  problemDetail: string;
  statusCode: string;
  status: string;
  repairStatus: string;
  repairedBy: string;
  ratingStatus: string;
  timeline: TrackingTimelineApiItem[];
  solution: string;
  repairedAt: string | null;
  customerConfirmDueAt: string | null;
  dueAt: string | null;
  reopenRounds?: ReopenRoundApiItem[];
}

interface AttachmentApiResponse {
  id: number;
  originalName: string;
  savedName: string;
  fileExt: string | null;
  uploadedAt?: string | null;
}

type TrackingDetailView = TrackingDetail & {
  repairedAt?: string | null;
};

function buildFileUrl(savedName: string): string {
  return `${BASE_URL}/uploads/requests/${encodeURIComponent(savedName)}`;
}

function mapFileType(fileExt: string | null): "pdf" | "image" {
  return fileExt?.trim().toLowerCase() === "pdf" ? "pdf" : "image";
}

function decodeFileName(name: string): string {
  if (!name) {
    return name;
  }

  const normalized = name.trim();

  try {
    const decoded = decodeURIComponent(escape(normalized));
    if (looksBetterThanOriginal(normalized, decoded)) {
      return decoded;
    }
  } catch {
    // ignore invalid escape sequences
  }

  return normalized;
}

function looksBetterThanOriginal(original: string, candidate: string): boolean {
  if (!candidate || candidate.includes("�")) {
    return false;
  }

  const originalThaiCount = countThaiChars(original);
  const candidateThaiCount = countThaiChars(candidate);

  if (candidateThaiCount > originalThaiCount) {
    return true;
  }

  return hasMojibakePattern(original) && !hasMojibakePattern(candidate);
}

function countThaiChars(value: string): number {
  return (value.match(/[\u0E00-\u0E7F]/g) ?? []).length;
}

function hasMojibakePattern(value: string): boolean {
  return /(?:Ã|Â|à¸|à¹|เธ|เน€)/u.test(value);
}

function mapFiles(files: AttachmentApiResponse[]): RepairFile[] {
  return files.map((file) => ({
    id: file.id,
    name: decodeFileName(file.originalName),
    type: mapFileType(file.fileExt),
    size: "-",
    uploadedAt: file.uploadedAt ?? "-",
    url: buildFileUrl(file.savedName),
  }));
}

function mapTrackingDetail(
  data: TrackingDetailApiResponse,
  requestFiles: RepairFile[],
  repairFiles: RepairFile[],
): TrackingDetailView {
  return {
    id: data.id,
    trackingNo: data.trackingNo,
    problem: data.problem,
    problemDetail: data.problemDetail,
    statusCode: data.statusCode,
    status: data.status,
    repairStatus: data.repairStatus,
    repairedBy: data.repairedBy,
    ratingStatus: data.ratingStatus,
    customerConfirmDueAt: data.customerConfirmDueAt,
    dueAt: data.dueAt,
    requestFiles,
    repairFiles,
    timeline: data.timeline.map((item) => ({
      label: item.label,
      date: item.date,
      time: item.time,
    })),
    solution: data.solution,
    repairedAt: data.repairedAt,
    reopenRounds: data.reopenRounds?.map((round) => ({
      roundNumber: round.roundNumber,
      requestConfirmationId: round.requestConfirmationId,
      reopenedAt: round.reopenedAt,
      comment: round.comment,
      files: mapFiles(round.files),
      staffSummary: round.staffSummary,
      staffFiles: mapFiles(round.staffFiles),
    })),
  };
}

function getActiveStep(statusCode: string | undefined): number {
  if (statusCode === "screening" || statusCode === "rejected") {
    return 2;
  }

  if (statusCode === "assigned" || statusCode === "in_progress") {
    return 3;
  }

  return 4;
}

function buildRepairDetail(request: TrackingDetailView): RepairDetail {
  if (request.statusCode === "rejected") {
    return {
      description: request.solution ?? "-",
      repairedAt: request.repairedAt ?? "-",
      files: request.repairFiles ?? [],
    };
  }

  return {
    description: request.solution ?? "-",
    repairedAt: "",
    files: request.repairFiles ?? [],
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
  const [rejectSubmitting, setRejectSubmitting] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const [prevRequestNo, setPrevRequestNo] = React.useState(requestNo);

  if (requestNo !== prevRequestNo) {
    setPrevRequestNo(requestNo);
    setLoading(true);
    setRequest(null);
    setError(null);
  }

  React.useEffect(() => {
    if (!requestNo || requestNo === "undefined") {
      return;
    }
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const detail = await fetchJson<TrackingDetailApiResponse>(
          `/user/requests/track/${encodeURIComponent(requestNo)}`,
          { signal: controller.signal },
        );

        const [requestAttachments, repairAttachments] = await Promise.all([
          fetchJson<AttachmentApiResponse[]>(
            `/requests/attachments?id=${detail.id}`,
            { signal: controller.signal },
          ),
          fetchJson<AttachmentApiResponse[]>(
            `/user/requests/${detail.id}/repair-attachments`,
            { signal: controller.signal },
          ),
        ]);

        setRequest(
          mapTrackingDetail(
            detail,
            mapFiles(requestAttachments),
            mapFiles(repairAttachments),
          ),
        );
        setLoading(false);
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

  async function rejectRequest(payload: { reason: string; files: File[] }) {
    if (!request) {
      return;
    }

    try {
      setRejectSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("reason", payload.reason);
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const result = await fetchJson<TrackingDetailApiResponse>(
        `/user/requests/${request.id}/reject`,
        {
          method: "POST",
          body: formData,
        },
      );

      setRequest((current) =>
        mapTrackingDetail(
          result,
          current?.requestFiles ?? [],
          current?.repairFiles ?? [],
        ),
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to reject request",
      );
    } finally {
      setRejectSubmitting(false);
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

      setRequest((current) =>
        mapTrackingDetail(
          result,
          current?.requestFiles ?? [],
          current?.repairFiles ?? [],
        ),
      );
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

      setRequest((current) =>
        mapTrackingDetail(
          result,
          current?.requestFiles ?? [],
          current?.repairFiles ?? [],
        ),
      );
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
    rejectSubmitting,
    countdown,
    activeStep: request ? getActiveStep(request.statusCode) : 4,
    buildRepairDetail,
    rejectRequest,
    confirmRequest,
    rateRequest,
  };
}
