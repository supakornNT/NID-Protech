"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";

import { TicketPdf, type TicketPdfData } from "./TicketPdf";

type TicketPdfButtonProps = {
  ticket: Pick<TicketPdfData, "trackingNo">;
  trackingPath: string;
  fileName?: string;
  buttonLabel?: string;
  iconOnly?: boolean;
};

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function buildAppUrl(path: string): string {
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = `${basePath}${normalizedPath}`;

  if (typeof window === "undefined") {
    return fullPath;
  }

  return new URL(fullPath, window.location.origin).toString();
}

function buildTrackingUrl(trackingPath: string): string {
  if (
    trackingPath.startsWith("http://") ||
    trackingPath.startsWith("https://")
  ) {
    return trackingPath;
  }

  return buildAppUrl(trackingPath);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(objectUrl);
}

type TicketPdfApiResponse = TicketPdfData;

export default function TicketPdfButton({
  ticket,
  trackingPath,
  fileName,
  buttonLabel = "Download PDF",
  iconOnly = false,
}: TicketPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const [qrCode, pdfResponse] = await Promise.all([
        QRCode.toDataURL(buildTrackingUrl(trackingPath)),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/user/requests/track/${encodeURIComponent(ticket.trackingNo)}/pdf-data`,
          {
            cache: "no-store",
          },
        ),
      ]);

      if (!pdfResponse.ok) {
        throw new Error(`Failed to load PDF data (${pdfResponse.status})`);
      }

      const pdfData = (await pdfResponse.json()) as TicketPdfApiResponse;
      const blob = await pdf(
        <TicketPdf
          ticket={pdfData}
          qrCode={qrCode}
          logoSrc={buildAppUrl("/ProTechLogoFinal.png")}
        />,
      ).toBlob();

      downloadBlob(blob, fileName ?? pdfData.documentFileName);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      disabled={loading}
      className={iconOnly ? "flex justify-center" : undefined}
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      {iconOnly ? (
        <FileText size={18} />
      ) : loading ? (
        "Preparing PDF..."
      ) : (
        buttonLabel
      )}
    </button>
  );
}
