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
}

export function clearStoredStaffSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STAFF_STORAGE_KEY);
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
