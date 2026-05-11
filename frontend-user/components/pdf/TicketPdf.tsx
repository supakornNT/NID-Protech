import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const fontSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/fonts/tahoma.ttf`;

Font.register({
  family: "TahomaPdf",
  src: fontSrc,
});

export type TicketPdfData = {
  trackingNo: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string | null;
  systemName: string | null;
  problemTypeName: string | null;
  problemTitle: string;
  problemDetail: string;
  issuedAt: string;
  dueDate: string | null;
  documentFileName: string;
};

type TicketPdfProps = {
  ticket: TicketPdfData;
  qrCode: string;
  logoSrc: string;
};

function formatValue(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "-";
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    fontFamily: "TahomaPdf",
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
    fontSize: 18,
    color: "#20498F",
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    color: "#111827",
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
    fontSize: 11,
    color: "#20498F",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 7,
  },
  label: {
    width: 112,
    fontSize: 10,
    color: "#6B7280",
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: "#111827",
  },
  multilineValue: {
    flex: 1,
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.45,
  },
  qrSection: {
    alignItems: "center",
    textAlign: "center",
    paddingTop: 2,
  },
  qr: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  qrCaption: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: 3,
  },
  footer: {
    marginTop: 4,
    paddingTop: 10,
    borderTop: "1px solid #D1D5DB",
  },
  footerText: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
  },
});

export function TicketPdf({ ticket, qrCode, logoSrc }: TicketPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <Text style={styles.brand}>ProTech Support</Text>
          <Text style={styles.title}>Ticket Tracking Reference</Text>
          <Text style={styles.subtitle}>
            Generated at {formatValue(ticket.issuedAt)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reference Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tracking No</Text>
            <Text style={styles.value}>{formatValue(ticket.trackingNo)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reporter</Text>
            <Text style={styles.value}>{formatValue(ticket.reporterName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{formatValue(ticket.reporterEmail)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{formatValue(ticket.reporterPhone)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>System</Text>
            <Text style={styles.value}>{formatValue(ticket.systemName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Problem Type</Text>
            <Text style={styles.value}>
              {formatValue(ticket.problemTypeName)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatValue(ticket.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.multilineValue}>
              {formatValue(ticket.problemTitle)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Detail</Text>
            <Text style={styles.multilineValue}>
              {formatValue(ticket.problemDetail)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Tracking</Text>
          <View style={styles.qrSection}>
            <Image src={qrCode} style={styles.qr} />
            
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
