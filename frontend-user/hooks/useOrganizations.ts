'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetch';

export interface Organization {
  id: number;
  name: string;
  type: string;
}

export function useOrganizations() {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchJson<Organization[]>('/admin/organizations/active', {
      signal: controller.signal,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { data, loading };
}
