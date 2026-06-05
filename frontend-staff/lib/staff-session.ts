export type StoredStaffSession = {
  id?: unknown;
  email?: string;
  name?: string;
  sessionExpiresAt?: string | null;
  modules?: {
    key: string;
    label: string;
    children?: {
      key: string;
      label: string;
    }[];
  }[];
};

const STAFF_STORAGE_KEY = "protech_staff";
const STAFF_AUTH_COOKIE = "protech_staff_auth";

function setStaffAuthCookie(staff: StoredStaffSession) {
  // Minimize the session object by stripping out Thai labels to fit within 4KB cookie limit
  const minimizedStaff = {
    id: staff.id,
    email: staff.email,
    name: staff.name,
    sessionExpiresAt: staff.sessionExpiresAt,
    modules: (staff.modules ?? []).map((module) => ({
      key: module.key,
      children: (module.children ?? []).map((p) => ({
        key: p.key,
      })),
    })),
  };

  const value = encodeURIComponent(JSON.stringify(minimizedStaff));
  let maxAge = 3600;
  if (staff.sessionExpiresAt) {
    const diff = Math.floor((new Date(staff.sessionExpiresAt).getTime() - Date.now()) / 1000);
    if (diff > 0) {
      maxAge = diff;
    }
  }
  document.cookie = `${STAFF_AUTH_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearStaffAuthCookie() {
  document.cookie = `${STAFF_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getCurrentStaff() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STAFF_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredStaffSession;
  } catch {
    return null;
  }
}

export function getCurrentStaffId() {
  const staff = getCurrentStaff();
  if (!staff) return null;
  const staffId = Number(staff.id);
  return Number.isFinite(staffId) && staffId > 0 ? staffId : null;
}

export function setStoredStaffSession(staff: StoredStaffSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  setStaffAuthCookie(staff);
}

export function clearStoredStaffSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STAFF_STORAGE_KEY);
  clearStaffAuthCookie();
}

export function requireCurrentStaffId() {
  const staffId = getCurrentStaffId();

  if (staffId) {
    return staffId;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("session:expired"));
  }

  throw new Error("ไม่พบข้อมูลเจ้าหน้าที่ กรุณาเข้าสู่ระบบใหม่");
}
