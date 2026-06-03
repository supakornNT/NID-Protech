"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ChevronDown, Menu, UserRound, X, LogOut } from "lucide-react";

import { getCurrentUser, StoredUserSession } from "@/lib/user-session";
import { fetchJson } from "@/lib/fetch";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [user, setUser] = useState<StoredUserSession | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(getCurrentUser());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      localStorage.removeItem("protech_user");
      setUser(null);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      
      await fetchJson("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/login");
    }
  }

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

        {user && (
          <div className={styles.desktopUser} ref={dropdownRef}>
            <div 
              className={styles.desktopUserTrigger}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : <UserRound size={18} />}
              </div>
              <span className={styles.desktopUserName}>{user.name}</span>
              <ChevronDown
                size={14}
                style={{ opacity: 0.7 }}
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            <div className={`${styles.desktopUserDropdownMenu} ${dropdownOpen ? styles.desktopUserDropdownMenuOpen : ""}`}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserName}>{user.name}</div>
                <div className={styles.dropdownUserEmail}>{user.email}</div>
              </div>
              <button 
                onClick={() => { void handleLogout(); }}
                className={`${styles.dropdownItem} ${styles.logoutButton}`}
              >
                <LogOut size={16} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        )}

        {user && (
          <button
            type="button"
            className={styles.mobileAvatarButton}
            aria-label="โปรไฟล์ผู้ใช้"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <UserRound size={20} />
          </button>
        )}
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

        {user && (
          <div className={styles.mobileProfileWrapper}>
            <div className={styles.mobileProfileInfo}>
              <div className={styles.mobileProfileAvatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : <UserRound size={16} />}
              </div>
              <div className={styles.mobileProfileDetails}>
                <span className={styles.mobileProfileName}>{user.name}</span>
                <span className={styles.mobileProfileEmail}>{user.email}</span>
              </div>
            </div>
            <button 
              onClick={() => { void handleLogout(); }}
              className={styles.mobileLogoutButton}
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
