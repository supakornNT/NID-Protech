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
  clearStoredUserSession,
  setStoredUserSession,
  type StoredUserSession,
} from "@/lib/user-session";

type UserSessionContextValue = {
  user: StoredUserSession | null;
  loading: boolean;
  sessionExpiredOpen: boolean;
  logout: () => Promise<void>;
};

const UserSessionContext = createContext<UserSessionContextValue | null>(null);

export function UserSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sessionExpiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [user, setUser] = useState<StoredUserSession | null>(null);
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
    clearStoredUserSession();
    setUser(null);
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
      console.error("Logout error:", error);
    } finally {
      clearSessionExpiryTimer();
      clearStoredUserSession();
      setUser(null);
      router.replace("/login");
    }
  }, [clearSessionExpiryTimer, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await fetchJson<StoredUserSession>(
          "/auth/me/customer",
          {
            cache: "no-store",
            skipSessionExpiredEvent: true,
          },
        );

        if (cancelled) {
          return;
        }

        setStoredUserSession(session);
        setUser(session);
        scheduleSessionExpiry(session.sessionExpiresAt);
        setLoading(false);
      } catch {
        if (cancelled) {
          return;
        }

        clearStoredUserSession();
        setUser(null);
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

  const value = useMemo<UserSessionContextValue>(
    () => ({
      user,
      loading,
      sessionExpiredOpen,
      logout,
    }),
    [loading, logout, sessionExpiredOpen, user],
  );

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);

  if (!context) {
    throw new Error("useUserSession must be used within UserSessionProvider");
  }

  return context;
}
