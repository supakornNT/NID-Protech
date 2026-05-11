"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText } from "lucide-react";
import QRCode from "qrcode";

import { TicketPdf, type TicketPdfData } from "./TicketPdf";

type TicketPdfButtonProps = {
  ticket: TicketPdfData;
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
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;
  const fullPath = `${basePath}${normalizedPath}`;

  if (typeof window === "undefined") {
    return fullPath;
  }

  return new URL(fullPath, window.location.origin).toString();
}

function buildTrackingUrl(trackingPath: string): string {
  if (trackingPath.startsWith("http://") || trackingPath.startsWith("https://")) {
    return trackingPath;
  }

  return buildAppUrl(trackingPath);
}

export default function TicketPdfButton({
  ticket,
  trackingPath,
  fileName,
  buttonLabel = "Download PDF",
  iconOnly = false,
}: TicketPdfButtonProps) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let active = true;

    async function createQr() {
      const qr = await QRCode.toDataURL(buildTrackingUrl(trackingPath));

      if (active) {
        setQrCode(qr);
      }
    }

    void createQr();

    return () => {
      active = false;
    };
  }, [trackingPath]);

  if (!qrCode) {
    return iconOnly ? (
      <button disabled className="flex justify-center opacity-40">
        <FileText size={18} />
      </button>
    ) : (
      <button disabled>Preparing QR...</button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <TicketPdf
          ticket={ticket}
          qrCode={qrCode}
          logoSrc={buildAppUrl("/ProTechLogoFinal.png")}
        />
      }
      fileName={fileName ?? `${ticket.ticketNo}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className={iconOnly ? "flex justify-center" : undefined}
          aria-label={buttonLabel}
          title={buttonLabel}
        >
          {iconOnly ? (
            <FileText size={18} />
          ) : loading ? "Preparing PDF..." : buttonLabel}
        </button>
      )}
    </PDFDownloadLink>
  );
}
