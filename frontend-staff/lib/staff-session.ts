type StoredStaffSession = {
  id?: unknown;
};

export function getCurrentStaffId() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem("protech_staff");

  if (!stored) {
    return null;
  }

  try {
    const staff = JSON.parse(stored) as StoredStaffSession;
    const staffId = Number(staff.id);

    return Number.isFinite(staffId) && staffId > 0 ? staffId : null;
  } catch {
    return null;
  }
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
