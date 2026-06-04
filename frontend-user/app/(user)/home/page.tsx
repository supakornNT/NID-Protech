"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Airplay,
  BadgeInfo,
  Mail,
  MapPin,
  Megaphone,
  Phone,
} from "lucide-react";

import { ProTechButton } from "@/components/tables/protech-button";
import { useUserSession } from "@/contexts/user-session-context";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";

import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const { user } = useUserSession();
  const { summary, loading, error } = useDashboardSummary();

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
        <div className={styles.requestCard}>
          <div className={styles.cardHeader}>
            <BadgeInfo size={34} />
            <div>
              <h2>แจ้งปัญหา/ข้อร้องเรียน</h2>
              <p>เลือกประเภทการแจ้งปัญหา</p>
            </div>
          </div>

          <div className={styles.requestOptions}>
            <div className={styles.requestOption}>
              <div className={styles.iconCircle}>
                <Airplay size={58} />
              </div>

              <h3>แจ้งปัญหา</h3>
              <p>แจ้งปัญหาเกี่ยวกับระบบ</p>

              <ProTechButton
                onClick={() => {
                  if (user?.organizationId) {
                    router.push("/request/internal");
                    return;
                  }

                  router.push("/request/external");
                }}
              >
                แจ้งปัญหา
              </ProTechButton>
            </div>

            <div className={styles.requestOption}>
              <div className={styles.iconCircle}>
                <Megaphone size={58} />
              </div>

              <h3>แจ้งข้อร้องเรียน</h3>
              <p>ร้องเรียนการให้บริการหรือพฤติกรรมของเจ้าหน้าที่</p>

              <ProTechButton onClick={() => router.push("/request/service")}>
                แจ้งข้อร้องเรียน
              </ProTechButton>
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
              <span>info@nidprotech.com</span>
            </div>

            <div className={styles.contactItem}>
              <MapPin size={22} />
              <span>
                1224 ถนนศรีนครินทร์ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร
                10250
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h2>การแจ้งประเด็นของฉัน</h2>
            {error ? <p>{error}</p> : null}

            <div className={styles.statusList}>
              <div className={styles.statusBox}>
                <span>ทั้งหมด</span>
                {loading ? (
                  <span className="mt-1 block h-9 w-12 animate-pulse rounded bg-gray-300/40" />
                ) : (
                  <strong>{summary.total}</strong>
                )}
              </div>

              <div className={styles.statusBox}>
                <span>ตรวจสอบ</span>
                {loading ? (
                  <span className="mt-1 block h-9 w-12 animate-pulse rounded bg-gray-300/40" />
                ) : (
                  <strong>{summary.screening}</strong>
                )}
              </div>

              <div className={styles.statusBox}>
                <span>ดำเนินการ</span>
                {loading ? (
                  <span className="mt-1 block h-9 w-12 animate-pulse rounded bg-gray-300/40" />
                ) : (
                  <strong>{summary.inProgress}</strong>
                )}
              </div>

              <div className={styles.statusBox}>
                <span>สำเร็จ</span>
                {loading ? (
                  <span className="mt-1 block h-9 w-12 animate-pulse rounded bg-gray-300/40" />
                ) : (
                  <strong>{summary.completed}</strong>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
