export type StoredUserSession = {
  id?: unknown;
  email?: string;
  name?: string;
  customerType?: "person" | "company";
  organizationId?: number | null;
};

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem("protech_user");

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUserSession;
  } catch {
    return null;
  }
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
