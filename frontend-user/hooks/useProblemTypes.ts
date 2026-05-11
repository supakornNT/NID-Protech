'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/api';

export interface ProblemType {
  id: number;
  name: string;
  report_type: string;
}

export function useProblemTypes(reportType: 'complaint' | 'issue') {
  const [data, setData] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchJson<ProblemType[]>(`/admin/problem-types/${reportType}`, {
      signal: controller.signal,
    })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [reportType]);

  return { data, loading };
}
