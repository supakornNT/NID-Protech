import { useState, useEffect } from "react";

export type StaffWithCount = {
  id: number;
  fullName: string;
  teamName: string | null;
  activeTaskCount: number;
};

export function useStaffList() {
  const [staffs, setStaffs] = useState<StaffWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/admin/staffs/with-task-count")
      .then((r) => r.json())
      .then((data) => setStaffs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return { staffs, loading };
}
