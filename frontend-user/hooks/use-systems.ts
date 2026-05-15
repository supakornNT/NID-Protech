"use client";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

export interface System {
  id: number;
  name: string;
}

export function useSystems(organizationId: number | null) {
  const [data, setData] = useState<System[]>([]);

  useEffect(() => {
    if (!organizationId) return;

    const controller = new AbortController();

    fetchJson<System[]>(`/admin/systems/by-organization/${organizationId}`, {
      signal: controller.signal,
    })
      .then(setData)
      .catch(() => {});

    return () => controller.abort();
  }, [organizationId]);

  return { data };
}
