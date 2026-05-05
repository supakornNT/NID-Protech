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

      <div className={styles.dropdown}>
        <div className={styles.dropdownTrigger}>
          แจ้งปัญหา <ChevronDown size={16} />
        </div>
        <div className={styles.dropdownMenu}>
          <a href="/report/system">แจ้งปัญหาระบบ</a>
          <a href="/report/service">แจ้งข้อร้องเรียน</a>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.avatar} />
        <span style={{ fontSize: 20, padding: 24 }}>ชื่อ - นามสกุล</span>
      </div>
    </nav>
  );
}
