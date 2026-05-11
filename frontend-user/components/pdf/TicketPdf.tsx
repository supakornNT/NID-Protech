import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type TicketPdfData = {
  ticketNo: string;
  reporterName: string;
  problem: string;
};

type TicketPdfProps = {
  ticket: TicketPdfData;
  qrCode: string;
  logoSrc: string;
};

function formatIssuedAt(): string {
  return new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "2px solid #2F66C5",
    alignItems: "flex-start",
  },
  logo: {
    width: 126,
    height: 36,
    objectFit: "contain",
    marginBottom: 10,
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    color: "#20498F",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  section: {
    marginBottom: 14,
    border: "1px solid #B8D0F6",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#F8FBFF",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#20498F",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 118,
    fontSize: 10,
    color: "#6B7280",
  },
  value: {
    flex: 1,
    fontSize: 11,
  },
  problemBox: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    border: "1px solid #D7E5FB",
  },
  problemText: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  qrSection: {
    alignItems: "center",
    textAlign: "center",
    paddingTop: 4,
  },
  qr: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  qrCaption: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 4,
  },
  noticeBox: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    border: "1px solid #D7E5FB",
  },
  noticeText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #D1D5DB",
  },
  footerText: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
});

export function TicketPdf({ ticket, qrCode, logoSrc }: TicketPdfProps) {
  const issuedAt = formatIssuedAt();
  const problemSummary = ticket.problem.trim().length > 0 ? ticket.problem : "-";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <Text style={styles.brand}>ProTech Support</Text>
          <Text style={styles.title}>Ticket Tracking Reference</Text>
          <Text style={styles.subtitle}>Generated at {issuedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reference Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Ticket No</Text>
            <Text style={styles.value}>{ticket.ticketNo}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reporter</Text>
            <Text style={styles.value}>{ticket.reporterName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Issued At</Text>
            <Text style={styles.value}>{issuedAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Notice</Text>
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              This PDF is generated once as a reference document.
            </Text>
            <Text style={styles.noticeText}>
              Use the QR code below to view the latest tracking status online.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Summary</Text>
          <View style={styles.problemBox}>
            <Text style={styles.problemText}>{problemSummary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Tracking</Text>
          <View style={styles.qrSection}>
            <Image src={qrCode} style={styles.qr} />
            <Text style={styles.qrCaption}>Scan to open the tracking page.</Text>
            <Text style={styles.qrCaption}>
              Use the QR code for the latest status update.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This document is generated automatically from the ProTech Support
            portal for customer tracking reference.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
