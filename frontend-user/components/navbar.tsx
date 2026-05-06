"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import styles from "./navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);


  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className={styles.nav}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label="เปิดเมนู"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={styles.logoArea}>
          <Image
            src="/ProTechLogoFinal.png"
            alt="ProTech Logo"
            width={148}
            height={42}
            className={styles.logoImage}
          />
        </div>

        <div className={styles.desktopLink}>
          <a href="/home">หน้าหลัก</a>
        </div>

        <div className={styles.desktopDropdown}>
          <div className={styles.desktopDropdownTrigger}>
            แจ้งปัญหา <ChevronDown size={16} />
          </div>
          <div className={styles.desktopDropdownMenu}>
            <a href="/report/system">เเจ้งประเด็นผู้ใช้งานระบบ สำหรับผู้ใช้งาน Site งาน</a>
            <a href="/report/normal">เเจ้งประเด็นผู้ใช้เเบบผู้ใช้งานทั้วไป/ประชาชน</a>
            <a href="/report/service">เเจ้งข้อร้องเรียนการให้บริการ</a>
          </div>
        </div>

        <div className={styles.desktopLink}>
          <a href="/track">การติดตาม</a>
        </div>

        <div className={styles.desktopUser}>
          <div className={styles.avatar} />
          <span className={styles.desktopUserName}>ชื่อ - นามสกุล</span>
        </div>

        <button
          type="button"
          className={styles.mobileAvatarButton}
          aria-label="โปรไฟล์ผู้ใช้"
        >
          <UserRound size={20} />
        </button>
      </nav>

      <div
        className={`${styles.mobileOverlay} ${
          mobileMenuOpen ? styles.mobileOverlayOpen : ""
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <div
        className={`${styles.mobilePanel} ${
          mobileMenuOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <a href="/home" className={styles.mobileItem}>
          <span className={styles.mobileItemLeft}>หน้าหลัก</span>
        </a>

        <button
          type="button"
          className={styles.mobileItemButton}
          onClick={() => setMobileSubmenuOpen((open) => !open)}
          aria-expanded={mobileSubmenuOpen}
        >
          <span className={styles.mobileItemLeft}>แจ้งปัญหา</span>
          <ChevronDown
            size={18}
            className={`${styles.submenuChevron} ${
              mobileSubmenuOpen ? styles.submenuChevronOpen : ""
            }`}
          />
        </button>

        <div
          className={`${styles.mobileSubmenu} ${
            mobileSubmenuOpen ? styles.mobileSubmenuOpen : ""
          }`}
        >
          <a href="/report/system" className={styles.mobileSubmenuItem}>
            แจ้งปัญหา
          </a>
          <a href="/report/service" className={styles.mobileSubmenuItem}>
            แจ้งข้อร้องเรียน
          </a>
        </div>

        <a href="/track" className={styles.mobileItem}>
          <span className={styles.mobileItemLeft}>การติดตาม</span>
        </a>
      </div>
    </>
  );
}
