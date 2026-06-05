"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";

import { useUserSession } from "@/contexts/user-session-context";
import proTechLogo from "@/public/ProTechLogoFinal.png";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileAvatarRef = useRef<HTMLButtonElement>(null);
  const { user, logout } = useUserSession();

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        dropdownRef.current.contains(target)
      ) {
        return;
      }

      if (
        mobileDropdownRef.current &&
        mobileDropdownRef.current.contains(target)
      ) {
        return;
      }

      if (
        mobileAvatarRef.current &&
        mobileAvatarRef.current.contains(target)
      ) {
        return;
      }

      setDropdownOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
  }

  const issueLink = user?.organizationId
    ? {
        href: "/request/internal",
        label: "รายงานปัญหาเกี่ยวกับระบบภายในองค์กร",
      }
    : {
        href: "/request/external",
        label: "รายงานปัญหาเกี่ยวกับระบบสาธารณะ",
      };

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
            src={proTechLogo}
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
            <Link href={issueLink.href}>{issueLink.label}</Link>
            <Link href="/request/service">แจ้งข้อร้องเรียนการให้บริการ</Link>
          </div>
        </div>

        <div className={styles.desktopLink}>
          <Link href="/track">การติดตาม</Link>
        </div>

        {user ? (
          <div className={styles.desktopUser} ref={dropdownRef}>
            <div
              className={styles.desktopUserTrigger}
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className={styles.avatar}>
                {user.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserRound size={18} />
                )}
              </div>
              <span className={styles.desktopUserName}>{user.name}</span>
              <ChevronDown
                size={14}
                style={{ opacity: 0.7 }}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            <div
              className={`${styles.desktopUserDropdownMenu} ${
                dropdownOpen ? styles.desktopUserDropdownMenuOpen : ""
              }`}
            >
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserName}>{user.name}</div>
                <div className={styles.dropdownUserEmail}>{user.email}</div>
              </div>
              <button
                onClick={() => {
                  void handleLogout();
                }}
                className={`${styles.dropdownItem} ${styles.logoutButton}`}
              >
                <LogOut size={16} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        ) : null}

        {user ? (
          <button
            ref={mobileAvatarRef}
            type="button"
            className={styles.mobileAvatarButton}
            aria-label="โปรไฟล์ผู้ใช้"
            onClick={() => {
              setMobileMenuOpen(false);
              setDropdownOpen((open) => !open);
            }}
          >
            <span className={styles.mobileAvatarInitial}>
              {user.name ? user.name.charAt(0).toUpperCase() : <UserRound size={18} />}
            </span>
          </button>
        ) : null}
      </nav>

      {user ? (
        <div
          ref={mobileDropdownRef}
          className={`${styles.mobileUserMenu} ${
            dropdownOpen ? styles.mobileUserMenuOpen : ""
          }`}
        >
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownUserName}>{user.name}</div>
            <div className={styles.dropdownUserEmail}>{user.email}</div>
          </div>
          <button
            onClick={() => {
              void handleLogout();
            }}
            className={`${styles.dropdownItem} ${styles.logoutButton}`}
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      ) : null}

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
            href={issueLink.href}
            className={styles.mobileSubmenuItem}
            onClick={() => setMobileMenuOpen(false)}
          >
            {issueLink.label}
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

        {user ? (
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setDropdownOpen(true);
            }}
            className={styles.mobileItemButton}
          >
            <span className={styles.mobileItemLeft}>บัญชีผู้ใช้</span>
            <UserRound size={18} />
          </button>
        ) : null}
      </div>
    </>
  );
}
