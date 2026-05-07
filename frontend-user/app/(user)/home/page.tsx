import {
  Airplay,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  BadgeInfo,
} from "lucide-react";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>ProTech Support</h1>
          <p className={styles.heroTitle}>
            ระบบรับแจ้งปัญหา และข้อร้องเรียนการให้บริการ
          </p>
          <p className={styles.heroDesc}>
            รองรับการแจ้งปัญหาการใช้งานระบบ และข้อร้องเรียนด้านการให้บริการ
            สามารถติดตามสถานะงาน และประเมินผลการดำเนินงานได้อย่างสะดวก
          </p>
        </div>
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
                1224 ถ.ศรีนครินทร์ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h2>การแจ้งประเด็นของฉัน</h2>

            <div className={styles.statusList}>
              <div className={styles.statusBox}>
                <span>ทั้งหมด</span>
                <strong>10</strong>
              </div>

              <div className={styles.statusBox}>
                <span>ตรวจสอบ</span>
                <strong>3</strong>
              </div>

              <div className={styles.statusBox}>
                <span>ดำเนินการ</span>
                <strong>4</strong>
              </div>

              <div className={styles.statusBox}>
                <span>สำเร็จ</span>
                <strong>3</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}