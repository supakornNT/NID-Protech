import {Airplay,Megaphone} from "lucide-react"
import styles from "./home.module.css";
export default function homePage() {
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>ProTech Support</h1>
          <p>ระบบเเจ้งปัญหา เเละข้อร้องเรียนการให้บริการ</p>
          <p>รองรับการเเจ้งปัญหาการใช้งานระบบ เเละข้อร้องเรียน</p>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.reportCard}>
          <h2>เเจ้งปัญหา/ข้อร้องเรียน</h2>
          <p>เลือกประเภทการเเจ้งปัญหา</p>
          <div className={styles.reportOptions}>
            <div className={styles.reportOption}>
              <Airplay size={75} color="#1a6fc4"/>
              <span>แจ้งปัญหา</span>
              <p>แจ้งปัญหาเกี่ยวกับระบบ</p>
              <button className={styles.reportBtn}>เเจ้งปัญหา</button>
            </div>
            <div className={styles.reportOption}>
              <Megaphone size={75} color="#1a6fc4"/>
              <span>เเจ้งข้อร้องเรียน</span>
              <p>ร้องเรียนการให้บริการ
                หรือพฤติกรรมเจ้าหน้าที่
              </p>
              <button className={styles.reportBtn}>แจ้งข้อร้องเรียน</button>
            </div>
          </div>
        </div>
        <div className={styles.contactCard}>
          <h2>ช่องทางการติดต่อ</h2>

          <div className={styles.contactItem}>
            <span>📞</span>
            <span>0 2745 4184</span>
          </div>

          <div className={styles.contactItem}>
            <span>✉️</span>
            <span>info@NID.protech.com</span>
          </div>

          <div className={styles.contactItem}>
            <span>📍</span>
            <span>
              1224 ถ.ศรีนครินทร์ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250
            </span>
          </div>
          <button className={styles.trackBtn}>การติดตาม ✓</button>
        </div>
      </section>
    </div>
  );
}
