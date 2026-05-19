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

Font.register({
  family: 'Sarabun',
  src: join(process.cwd(), 'src/requests/fonts/Sarabun/Sarabun-Regular.ttf'),
});

const logoSrc = join(process.cwd(), 'src/requests/assets/ProTechLogoFinal.png');

function formatValue(value: string | null | undefined): string {
  if (!value) return '-';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '-';
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Sarabun',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: '2px solid #2F66C5',
    alignItems: 'flex-start',
  },
  logo: {
    width: 126,
    height: 36,
    objectFit: 'contain',
    marginBottom: 10,
  },
  brand: {
    fontSize: 18,
    color: '#20498F',
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  section: {
    marginBottom: 14,
    border: '1px solid #B8D0F6',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#F8FBFF',
  },
  sectionTitle: {
    fontSize: 11,
    color: '#20498F',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  label: {
    width: 112,
    fontSize: 10,
    color: '#6B7280',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
  },
  multilineValue: {
    flex: 1,
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.45,
  },
  footer: {
    marginTop: 4,
    paddingTop: 10,
    borderTop: '1px solid #D1D5DB',
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export type RequestData = {
  id: number;
  title: string;
  detail: string;
  customerName: string;
  systemName: string;
  assignedStaffName: string | null;
  dueAt: string | null;
};

export function RequestTemplate({ data }: { data: RequestData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSrc} style={styles.logo} />
          <Text style={styles.brand}>ProTech Support</Text>
          <Text style={styles.title}>Request Reference</Text>
          <Text style={styles.subtitle}>
            Generated at {new Date().toLocaleString('th-TH')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ข้อมูลการแจ้ง</Text>

          <View style={styles.row}>
            <Text style={styles.label}>ผู้แจ้ง</Text>
            <Text style={styles.value}>{formatValue(data.customerName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ระบบ</Text>
            <Text style={styles.value}>{formatValue(data.systemName)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ผู้รับผิดชอบ</Text>
            <Text style={styles.value}>
              {formatValue(data.assignedStaffName)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>วันที่ส่ง</Text>
            <Text style={styles.value}>{formatValue(data.dueAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รายละเอียดปัญหา</Text>

          <View style={styles.row}>
            <Text style={styles.label}>หัวข้อปัญหา</Text>
            <Text style={styles.multilineValue}>{formatValue(data.title)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>รายละเอียด</Text>
            <Text style={styles.multilineValue}>
              {formatValue(data.detail)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            เอกสารนี้ถูกสร้างอัตโนมัติจากระบบ ProTech Support
          </Text>
        </View>
      </Page>
    </Document>
  );
}
