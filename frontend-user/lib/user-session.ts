export type StoredUserSession = {
  id?: unknown;
  email?: string;
  name?: string;
  customerType?: "person" | "company";
  organizationId?: number | null;
  sessionExpiresAt?: string | null;
};

const USER_STORAGE_KEY = "protech_user";
const USER_AUTH_COOKIE = "protech_user_auth";

function setUserAuthCookie(user: StoredUserSession) {
  const value = encodeURIComponent(JSON.stringify(user));
  const maxAge = user.sessionExpiresAt
    ? Math.floor((new Date(user.sessionExpiresAt).getTime() - Date.now()) / 1000)
    : 3600;
  document.cookie = `${USER_AUTH_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearUserAuthCookie() {
  document.cookie = `${USER_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function syncOrganizationCookie(organizationId?: number | null) {
  if (typeof document === "undefined") {
    return;
  }

  if (organizationId) {
    document.cookie = `organization_id=${organizationId}; path=/; max-age=86400; SameSite=Lax`;
    return;
  }

  document.cookie = "organization_id=; path=/; max-age=0; SameSite=Lax";
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUserSession;
  } catch {
    return null;
  }
}

export function setStoredUserSession(user: StoredUserSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  syncOrganizationCookie(user.organizationId);
  setUserAuthCookie(user);
}

export function clearStoredUserSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
  syncOrganizationCookie(null);
  clearUserAuthCookie();
}

export function getCurrentUserId() {
  const user = getCurrentUser();
  if (!user) return null;
  const userId = Number(user.id);
  return Number.isFinite(userId) && userId > 0 ? userId : null;
}

export function requireCurrentUser() {
  const user = getCurrentUser();

  if (user) {
    return user;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("session:expired"));
  }

  throw new Error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
}
