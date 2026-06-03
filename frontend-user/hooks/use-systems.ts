"use client";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch";

export interface System {
  id: number;
  name: string;
  status?: string;
}

export function useSystems(organizationId: number | null, fetchAll: boolean = false) {
  const [data, setData] = useState<System[]>([]);

  useEffect(() => {
    if (!organizationId && !fetchAll) return;

    const controller = new AbortController();

    if (fetchAll) {
      fetchJson<System[]>("/admin/systems", {
        signal: controller.signal,
      })
        .then((systems) => {
          setData(systems.filter((s) => s.status === "active"));
        })
        .catch(() => {});
    } else {
      fetchJson<System[]>(`/admin/systems/by-organization/${organizationId}`, {
        signal: controller.signal,
      })
        .then(setData)
        .catch(() => {});
    }

    return () => controller.abort();
  }, [organizationId, fetchAll]);

  return { data };
}
