"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ChevronDown, Menu, UserRound, X } from "lucide-react";

import styles from "./navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.nav}>
        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label="เปิดเมนู"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* LOGO */}
        <div className={styles.logoArea}>
          <Image
            src="/ProTechLogoFinal.png"
            alt="ProTech Logo"
            width={148}
            height={42}
            className={styles.logoImage}
          />
        </div>

        {/* DESKTOP LINKS */}
        <div className={styles.desktopLink}>
          <Link href="/home">หน้าหลัก</Link>
        </div>

        {/* DESKTOP DROPDOWN */}
        <div className={styles.desktopDropdown}>
          <div className={styles.desktopDropdownTrigger}>
            แจ้งปัญหา <ChevronDown size={16} />
          </div>

          <div className={styles.desktopDropdownMenu}>
            <Link href="/report/system">
              เเจ้งประเด็นผู้ใช้งานระบบ สำหรับผู้ใช้งาน Site งาน
            </Link>

            <Link href="/report/normal">
              เเจ้งประเด็นผู้ใช้เเบบผู้ใช้งานทั้วไป/ประชาชน
            </Link>

            <Link href="/report/service">เเจ้งข้อร้องเรียนการให้บริการ</Link>
          </div>
        </div>

        <div className={styles.desktopLink}>
          <Link href="/track">การติดตาม</Link>
        </div>

        {/* USER */}
        <div className={styles.desktopUser}>
          <div className={styles.avatar} />

          <span className={styles.desktopUserName}>ชื่อ - นามสกุล</span>
        </div>

        {/* MOBILE USER BUTTON */}
        <button
          type="button"
          className={styles.mobileAvatarButton}
          aria-label="โปรไฟล์ผู้ใช้"
        >
          <UserRound size={20} />
        </button>
      </nav>

      {/* OVERLAY */}
      <div
        className={`${styles.mobileOverlay} ${
          mobileMenuOpen ? styles.mobileOverlayOpen : ""
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* MOBILE PANEL */}
      <div
        className={`${styles.mobilePanel} ${
          mobileMenuOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        {/* HOME */}
        <Link
          href="/home"
          className={styles.mobileItem}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className={styles.mobileItemLeft}>หน้าหลัก</span>
        </Link>

        {/* MOBILE DROPDOWN */}
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

        {/* MOBILE SUBMENU */}
        <div
          className={`${styles.mobileSubmenu} ${
            mobileSubmenuOpen ? styles.mobileSubmenuOpen : ""
          }`}
        >
          <Link
            href="/report/system"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
          เเจ้งประเด็นผู้ใช้งานระบบ สำหรับผู้ใช้งาน Site งาน
          </Link>

          <Link
            href="/report/normal"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
             เเจ้งประเด็นผู้ใช้เเบบผู้ใช้งานทั้วไป/ประชาชน
          </Link>
          
          <Link
            href="/report/service"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
              เเจ้งข้อร้องเรียนการให้บริการ
          </Link>
        </div>

        {/* TRACK */}
        <Link
          href="/track"
          className={styles.mobileItem}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className={styles.mobileItemLeft}>การติดตาม</span>
        </Link>
      </div>
    </>
  );
}
