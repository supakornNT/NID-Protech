"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { fetchJson } from "@/lib/fetch";
import {
  clearStoredStaffSession,
  setStoredStaffSession,
  type StoredStaffSession,
} from "@/lib/staff-session";

type StaffSessionContextValue = {
  staff: StoredStaffSession | null;
  loading: boolean;
  sessionExpiredOpen: boolean;
  logout: () => Promise<void>;
};

const StaffSessionContext = createContext<StaffSessionContextValue | null>(
  null,
);

export function StaffSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sessionExpiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [staff, setStaff] = useState<StoredStaffSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  const clearSessionExpiryTimer = useCallback(() => {
    if (sessionExpiryTimerRef.current) {
      clearTimeout(sessionExpiryTimerRef.current);
      sessionExpiryTimerRef.current = null;
    }
  }, []);

  const showSessionExpired = useCallback(() => {
    clearSessionExpiryTimer();
    clearStoredStaffSession();
    setStaff(null);
    setSessionExpiredOpen(true);
    setLoading(false);
  }, [clearSessionExpiryTimer]);

  const scheduleSessionExpiry = useCallback(
    (expiresAt?: string | null) => {
      clearSessionExpiryTimer();

      if (!expiresAt) {
        return;
      }

      const delay = new Date(expiresAt).getTime() - Date.now();

      if (delay <= 0) {
        showSessionExpired();
        return;
      }

      sessionExpiryTimerRef.current = setTimeout(showSessionExpired, delay);
    },
    [clearSessionExpiryTimer, showSessionExpired],
  );

  const logout = useCallback(async () => {
    try {
      await fetchJson("/auth/logout", {
        method: "POST",
        skipSessionExpiredEvent: true,
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearSessionExpiryTimer();
      clearStoredStaffSession();
      setStaff(null);
      router.replace("/login");
    }
  }, [clearSessionExpiryTimer, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await fetchJson<StoredStaffSession>("/auth/me", {
          cache: "no-store",
          skipSessionExpiredEvent: true,
        });

        if (cancelled) {
          return;
        }

        setStoredStaffSession(session);
        setStaff(session);
        scheduleSessionExpiry(session.sessionExpiresAt);
        setLoading(false);
      } catch {
        if (cancelled) {
          return;
        }

        clearStoredStaffSession();
        setStaff(null);
        router.replace("/login");
      }
    }

    function onSessionExpired() {
      if (!cancelled) {
        showSessionExpired();
      }
    }

    window.addEventListener("session:expired", onSessionExpired);
    void loadSession();

    return () => {
      cancelled = true;
      clearSessionExpiryTimer();
      window.removeEventListener("session:expired", onSessionExpired);
    };
  }, [clearSessionExpiryTimer, router, scheduleSessionExpiry, showSessionExpired]);

  const value = useMemo<StaffSessionContextValue>(
    () => ({
      staff,
      loading,
      sessionExpiredOpen,
      logout,
    }),
    [loading, logout, sessionExpiredOpen, staff],
  );

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession() {
  const context = useContext(StaffSessionContext);

  if (!context) {
    throw new Error("useStaffSession must be used within StaffSessionProvider");
  }

  return context;
}
