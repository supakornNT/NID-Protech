"use client";

import * as React from "react";
import Image from "next/image";
import {
  Airplay,
  BadgeInfo,
  Mail,
  MapPin,
  Megaphone,
  Phone,
} from "lucide-react";

import styles from "./home.module.css";

interface DashboardSummary {
  total: number;
  screening: number;
  inProgress: number;
  completed: number;
}

const DEFAULT_SUMMARY: DashboardSummary = {
  total: 0,
  screening: 0,
  inProgress: 0,
  completed: 0,
};

function buildApiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export default function HomePage() {
  const [summary, setSummary] =
    React.useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchJson<DashboardSummary>(
          "/user/dashboard-summary",
          controller.signal,
        );

        setSummary(data);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard summary",
        );
        setSummary(DEFAULT_SUMMARY);
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();

    return () => controller.abort();
  }, []);

  const totalValue = loading ? "..." : String(summary.total);
  const screeningValue = loading ? "..." : String(summary.screening);
  const inProgressValue = loading ? "..." : String(summary.inProgress);
  const completedValue = loading ? "..." : String(summary.completed);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/images/banner.png"
          alt="ProTech Support banner"
          width={1600}
          height={720}
          priority
          className={styles.heroBanner}
        />
      </section>

      <section className={styles.content}>
        <div className={styles.reportCard}>
          <div className={styles.cardHeader}>
            <BadgeInfo size={34} />
            <div>
              <h2>แจ้งปัญหา/ข้อร้องเรียน</h2>
              <p>เลือกประเภทการแจ้งปัญหา</p>
            </div>
          </div>

          <div className={styles.reportOptions}>
            <div className={styles.reportOption}>
              <div className={styles.iconCircle}>
                <Airplay size={58} />
              </div>

              <h3>แจ้งปัญหา</h3>
              <p>แจ้งปัญหาเกี่ยวกับระบบ</p>

              <button className={styles.reportBtn}>แจ้งปัญหา</button>
            </div>

            <div className={styles.reportOption}>
              <div className={styles.iconCircle}>
                <Megaphone size={58} />
              </div>

              <h3>แจ้งข้อร้องเรียน</h3>
              <p>ร้องเรียนการให้บริการหรือพฤติกรรมของเจ้าหน้าที่</p>

              <button className={styles.reportBtn}>แจ้งข้อร้องเรียน</button>
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.contactCard}>
            <h2>ช่องทางการติดต่อ</h2>

            <div className={styles.contactItem}>
              <Phone size={22} />
              <span>โทร 0 2745 4184</span>
            </div>

            <div className={styles.contactItem}>
              <Mail size={22} />
              <span>info@NID.protech.com</span>
            </div>

            <div className={styles.contactItem}>
              <MapPin size={22} />
              <span>
                1224 เธ–.เธจเธฃเธตเธเธเธฃเธดเธเธ—เธฃเน
                เนเธเธงเธเธชเธงเธเธซเธฅเธงเธ เน€เธเธ•เธชเธงเธเธซเธฅเธงเธ
                เธเธฃเธธเธเน€เธ—เธเธกเธซเธฒเธเธเธฃ 10250
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h2>การแจ้งประเด็นของฉัน</h2>
            {error ? <p>{error}</p> : null}

            <div className={styles.statusList}>
              <div className={styles.statusBox}>
                <span>ทั้งหมด</span>
                <strong>{totalValue}</strong>
              </div>

              <div className={styles.statusBox}>
                <span>ตรวจสอบ</span>
                <strong>{screeningValue}</strong>
              </div>

              <div className={styles.statusBox}>
                <span>ดำเนินการ</span>
                <strong>{inProgressValue}</strong>
              </div>

              <div className={styles.statusBox}>
                <span>สำเร็จ</span>
                <strong>{completedValue}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
