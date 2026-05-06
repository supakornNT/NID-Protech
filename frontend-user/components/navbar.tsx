"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

import styles from "./navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.topRow}>
        <div className={styles.logoArea}>
          <Image
            src="/ProTechLogoFinal.png"
            alt="ProTech Logo"
            width={200}
            height={200}
          />
        </div>

        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => {
            setMobileMenuOpen((open) => {
              const nextOpen = !open;

              if (!nextOpen) {
                setMobileDropdownOpen(false);
              }

              return nextOpen;
            });
          }}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`${styles.navContent} ${
          mobileMenuOpen ? styles.navContentOpen : ""
        }`}
      >
        <div className={styles.link}>
          <a href="/home">หน้าหลัก</a>
        </div>

        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.dropdownTrigger}
            onClick={() => setMobileDropdownOpen((open) => !open)}
            aria-expanded={mobileDropdownOpen}
          >
            แจ้งปัญหา <ChevronDown size={16} />
          </button>

          <div
            className={`${styles.dropdownMenu} ${
              mobileDropdownOpen ? styles.dropdownMenuOpen : ""
            }`}
          >
            <a href="/report/system">แจ้งปัญหาการใช้งานระบบสำหรับผู้ใช้งาน Site งาน</a>
            <a href="/report/normal">แจ้งปัญหาสำหรับผู้ใช้งานทั่วไป/ประชาชน</a>
            <a href="/report/service">แจ้งข้อร้องเรียนการให้บริการ</a>
          </div>
        </div>

        <div className={styles.link}>
          <a href="/track">การติดตาม</a>
        </div>

        <div className={styles.user}>
          <div className={styles.avatar} />
          <span className={styles.userName}>ชื่อ - นามสกุล</span>
        </div>
      </div>
    </nav>
  );
}
