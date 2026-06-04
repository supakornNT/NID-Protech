import React from 'react';
import { join } from 'path';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ScreeningPdfData } from '../interfaces/screening-pdf.interface';

export type { ScreeningPdfData as ScreeningReceiptData };

Font.register({
  family: 'Sarabun',
  src: join(process.cwd(), 'src/requests/fonts/Sarabun/Sarabun-Regular.ttf'),
});

const logoSrc = join(
  process.cwd(),
  'src/requests/assets/ProTechLogoFinal.png',
);

function formatThaiDate(date: Date): string {
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatValue(value: string | null | undefined): string {
  if (!value) return '-';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '-';
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Sarabun',
  },

  // ── Header bar ──────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  logo: {
    width: 100,
    height: 28,
    objectFit: 'contain',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 14,
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#374151',
    marginTop: 2,
  },

  // ── Document meta (right-aligned) ──────────────────────────────────────
  metaBlock: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  metaText: {
    fontSize: 10,
    color: '#111827',
    marginBottom: 3,
  },

  // ── เรื่อง row ──────────────────────────────────────────────────────────
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  subjectLabel: {
    fontSize: 10,
    color: '#374151',
    marginRight: 8,
    paddingBottom: 2,
  },
  subjectValue: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
    paddingBottom: 2,
    borderBottom: '1px solid #374151',
  },

  // ── Section heading ─────────────────────────────────────────────────────
  sectionHeading: {
    fontSize: 11,
    color: '#111827',
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderLeft: '3px solid #374151',
  },

  // ── Labeled field rows ──────────────────────────────────────────────────
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#374151',
    marginRight: 8,
    paddingBottom: 2,
    minWidth: 100,
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
    paddingBottom: 2,
    borderBottom: '1px solid #374151',
  },

  // ── Two-column field layout ─────────────────────────────────────────────
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 16,
  },
  twoColField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  twoColLabel: {
    fontSize: 10,
    color: '#374151',
    marginRight: 6,
    paddingBottom: 2,
  },
  twoColValue: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
    paddingBottom: 2,
    borderBottom: '1px solid #374151',
  },

  // ── รายละเอียดปัญหา box ────────────────────────────────────────────────
  detailBox: {
    border: '1px solid #D1D5DB',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    minHeight: 100,
  },
  detailText: {
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.8,
  },
  detailLineSeparator: {
    borderBottom: '1px solid #E5E7EB',
    marginTop: 10,
  },

  // ── Section spacing ─────────────────────────────────────────────────────
  sectionBlock: {
    marginBottom: 18,
  },

  // ── Bottom row: QR + signature ──────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  qrBlock: {
    alignItems: 'center',
    width: 100,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  signatureBlock: {
    alignItems: 'center',
    minWidth: 160,
  },
  signatureLine: {
    width: 160,
    borderBottom: '1px solid #374151',
    marginBottom: 4,
  },
  signatureNameText: {
    fontSize: 10,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  signatureDateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  signatureDateLabel: {
    fontSize: 10,
    color: '#374151',
    marginRight: 6,
  },
  signatureDateValue: {
    fontSize: 10,
    color: '#111827',
    borderBottom: '1px solid #374151',
    minWidth: 100,
    paddingBottom: 1,
  },
  signatureRoleLabel: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: '1px solid #D1D5DB',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
  },
});

const DETAIL_LINE_COUNT = 6;

export function ScreeningReceiptTemplate({
  data,
  qrDataUrl,
}: {
  data: ScreeningPdfData;
  qrDataUrl: string;
}) {
  const createdAtFormatted = formatThaiDate(data.createdAt);
  const screenedAtFormatted = formatThaiDate(data.screenedAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header bar ── */}
        <View style={styles.headerBar}>
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>หน่วยงาน / องค์กร</Text>
            <Text style={styles.headerSubtitle}>
              แบบฟอร์มใบรับแจ้งปัญหา / Service Request Form
            </Text>
          </View>
        </View>

        {/* ── Document meta ── */}
        <View style={styles.metaBlock}>
          <Text style={styles.metaText}>
            เลขที่เอกสาร: {formatValue(data.requestNo)}
          </Text>
          <Text style={styles.metaText}>
            วันที่รับแจ้ง: {createdAtFormatted}
          </Text>
        </View>

        {/* ── เรื่อง ── */}
        <View style={styles.subjectRow}>
          <Text style={styles.subjectLabel}>เรื่อง</Text>
          <Text style={styles.subjectValue}>{formatValue(data.title)}</Text>
        </View>

        {/* ── ข้อมูลผู้แจ้ง ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>ข้อมูลผู้แจ้ง</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>ชื่อ-นามสกุล</Text>
            <Text style={styles.fieldValue}>
              {formatValue(data.customerName)}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>แผนก/หน่วยงาน</Text>
            <Text style={styles.fieldValue}>
              {formatValue(data.organization)}
            </Text>
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.twoColField}>
              <Text style={styles.twoColLabel}>เบอร์โทรศัพท์</Text>
              <Text style={styles.twoColValue}>
                {formatValue(data.customerPhone)}
              </Text>
            </View>
            <View style={styles.twoColField}>
              <Text style={styles.twoColLabel}>อีเมล</Text>
              <Text style={styles.twoColValue}>
                {formatValue(data.customerEmail)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── รายละเอียดปัญหา ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>รายละเอียดปัญหา</Text>
          <View style={styles.detailBox}>
            <Text style={styles.detailText}>{formatValue(data.detail)}</Text>
            {Array.from({ length: DETAIL_LINE_COUNT }).map((_, i) => (
              <View key={i} style={styles.detailLineSeparator} />
            ))}
          </View>
        </View>

        {/* ── Bottom: QR + Signature ── */}
        <View style={styles.bottomRow}>
          {/* QR code — left */}
          <View style={styles.qrBlock}>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrLabel}>สแกนเพื่อติดตามสถานะ</Text>
          </View>

          {/* Signature block — right */}
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureNameText}>
              {formatValue(data.staffName)}
            </Text>
            <View style={styles.signatureDateRow}>
              <Text style={styles.signatureDateLabel}>วันที่ดำเนินการ</Text>
              <Text style={styles.signatureDateValue}>
                {screenedAtFormatted}
              </Text>
            </View>
            <Text style={styles.signatureRoleLabel}>
              เจ้าหน้าที่ผู้รับเรื่อง
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            เลขที่เอกสาร: {formatValue(data.requestNo)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
