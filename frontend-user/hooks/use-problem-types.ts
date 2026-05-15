'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetch';

export interface ProblemType {
  id: number;
  name: string;
  request_type: string;
}

export function useProblemTypes(requestType: 'complaint' | 'issue') {
  const [data, setData] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchJson<ProblemType[]>(`/admin/problem-types/${requestType}`, {
      signal: controller.signal,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [requestType]);

  return { data, loading };
}
