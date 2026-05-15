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
            loading="eager"
            className={styles.logoImage}
          />
        </div>

        <div className={styles.desktopLink}>
          <Link href="/home">หน้าหลัก</Link>
        </div>

        <div className={styles.desktopDropdown}>
          <div className={styles.desktopDropdownTrigger}>
            แจ้งปัญหา <ChevronDown size={16} />
          </div>

          <div className={styles.desktopDropdownMenu}>
            <Link href="/request/internal">
              รายงานปัญหาเกี่ยวกับระบบภายในองค์กร
            </Link>
            <Link href="/request/external">
              รายงานปัญหาเกี่ยวกับระบบสาธารณะ
            </Link>
            <Link href="/request/service">
              แจ้งข้อร้องเรียนการให้บริการ
            </Link>
          </div>
        </div>

        <div className={styles.desktopLink}>
          <Link href="/track">การติดตาม</Link>
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
        <Link
          href="/home"
          className={styles.mobileItem}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className={styles.mobileItemLeft}>หน้าหลัก</span>
        </Link>

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
          <Link
            href="/request/internal"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
            รายงานปัญหาเกี่ยวกับระบบภายในองค์กร
          </Link>

          <Link
            href="/request/external"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
            รายงานปัญหาเกี่ยวกับระบบสาธารณะ
          </Link>

          <Link
            href="/request/service"
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
            แจ้งข้อร้องเรียนการให้บริการ
          </Link>
        </div>

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
