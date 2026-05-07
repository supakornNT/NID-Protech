import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logoArea}>
        <Image
          src="/ProTechLogoFinal.png"
          alt="ProTech Logo"
          width={200}
          height={200}
        />
      </div>
      <div className={styles.link}>
        <a href="/home">หน้าหลัก</a>
      </div>

      <div className={styles.dropdown}>
        <div className={styles.dropdownTrigger}>
          แจ้งปัญหา <ChevronDown size={16} />
        </div>
        <div className={styles.dropdownMenu}>
          <a href="/report/internal">รายงานปัญหาเกี่ยวกับระบบภายในองค์กร</a>
          <a href="/report/external">รายงานปัญหาเกี่ยวกับระบบสาธารณะ</a>
          <a href="/report/service">เเจ้งข้อร้องเรียนการให้บริการ</a>
        </div>
      </div>

      <div className={styles.link}>
        <a href="/track">การติดตาม</a>
      </div>

      <div className={styles.user}>
        <div className={styles.avatar} />
        <span style={{ fontSize: 20, padding: 24 }}>ชื่อ - นามสกุล</span>
      </div>
    </nav>
  );
}
