'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetch';

interface CustomerName {
  name: string;
  surname: string;
  email: string;
  phone: string;
  organization_id: number | null;
}

export function useCustomer(id: number | null) {
  const [data, setData] = useState<CustomerName | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    fetchJson<CustomerName>(`/customers/name/${id}`, {
      signal: controller.signal,
    })
      .then(setData)
      .catch(() => {});

    return () => controller.abort();
  }, [id]);

  const fullName = id === null
    ? 'ไม่ระบุตัวตน'
    : data
      ? `${data.name} ${data.surname}`
      : '';

  return { data, fullName };
}
