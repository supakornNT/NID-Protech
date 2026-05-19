import { useState, useEffect, useCallback } from "react";

export type StaffWithCount = {
  id: number;
  fullName: string;
  teamId: number | null;
  teamName: string | null;
  activeTaskCount: number;
};

export function useStaffList() {
  const [staffs, setStaffs] = useState<StaffWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(() => {
    fetch("http://localhost:4000/admin/staffs/with-task-count")
      .then((r) => r.json())
      .then((data) => setStaffs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { staffs, loading, refetch: fetch_ };
}
