'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetch';

export interface RegisterPrefixOption {
  value: number;
  label: string;
}

export interface RegisterOrganizationOption {
  id: number;
  name: string;
  type: string;
}

export interface RegisterOptions {
  prefixes: RegisterPrefixOption[];
  organizations: RegisterOrganizationOption[];
}

interface StaffUserOptionsResponse {
  prefixes?: RegisterPrefixOption[];
}

const DEFAULT_OPTIONS: RegisterOptions = {
  prefixes: [],
  organizations: [],
};

export function useRegisterOptions() {
  const [data, setData] = useState<RegisterOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const options = await fetchJson<RegisterOptions>('/auth/register-options', {
          signal: controller.signal,
        });
        setData(options);
      } catch (error) {
        const [staffOptions, organizations] = await Promise.all([
          fetchJson<StaffUserOptionsResponse>('/admin/staffs/users/options', {
            signal: controller.signal,
          }).catch(() => ({ prefixes: [] })),
          fetchJson<RegisterOrganizationOption[]>('/admin-organizations/active', {
            signal: controller.signal,
          }).catch(() => []),
        ]);

        setData({
          prefixes: staffOptions.prefixes ?? [],
          organizations,
        });

        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load /auth/register-options, used fallback options.', error);
        }
      }
    }

    loadOptions()
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { data, loading };
}
