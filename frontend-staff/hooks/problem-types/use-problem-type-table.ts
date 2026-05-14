"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ProblemTypeRequestType = "issue" | "complaint";

export type ProblemTypeApiItem = {
  id: number;
  code: string | null;
  name: string;
  request_type: ProblemTypeRequestType;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

export type ProblemTypePayload = {
  code?: string | null;
  name: string;
  requestType: ProblemTypeRequestType;
  status: string;
};

type UseProblemTypeTableOptions = {
  search: string;
  requestType: string;
};

export function useProblemTypeTable({
  search,
  requestType,
}: UseProblemTypeTableOptions) {
  const [items, setItems] = useState<ProblemTypeApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProblemTypes = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (requestType !== "all") {
        params.set("requestType", requestType);
      }

      const query = params.toString();
      const response = await fetch(
        `${API_BASE_URL}/admin/problem-types${query ? `?${query}` : ""}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load problem types (${response.status})`);
      }

      const result = (await response.json()) as ProblemTypeApiItem[];
      setItems(result);
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลประเภทประเด็นและคำร้องได้");
    } finally {
      setLoading(false);
    }
  }, [requestType, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProblemTypes();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchProblemTypes]);

  const createProblemType = useCallback(
    async (payload: ProblemTypePayload) => {
      try {
        setSaving(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: payload.name.trim(),
            requestType: payload.requestType,
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create problem type (${response.status})`);
        }

        await fetchProblemTypes();
        return true;
      } catch (createError) {
        console.error(createError);
        setError("ไม่สามารถสร้างประเภทประเด็นหรือคำร้องได้");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchProblemTypes],
  );

  const updateProblemType = useCallback(
    async (id: number, payload: ProblemTypePayload) => {
      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: payload.name.trim(),
            requestType: payload.requestType,
            status: payload.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update problem type (${response.status})`);
        }

        await fetchProblemTypes();
        return true;
      } catch (updateError) {
        console.error(updateError);
        setError("ไม่สามารถแก้ไขประเภทประเด็นหรือคำร้องได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [fetchProblemTypes],
  );

  const removeProblemType = useCallback(
    async (id: number) => {
      if (activeId !== null) {
        return false;
      }

      try {
        setActiveId(id);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/admin/problem-types/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to remove problem type (${response.status})`);
        }

        await fetchProblemTypes();
        return true;
      } catch (removeError) {
        console.error(removeError);
        setError("ไม่สามารถลบประเภทประเด็นหรือคำร้องได้");
        return false;
      } finally {
        setActiveId(null);
      }
    },
    [activeId, fetchProblemTypes],
  );

  return {
    items,
    loading,
    error,
    activeId,
    saving,
    fetchProblemTypes,
    createProblemType,
    updateProblemType,
    removeProblemType,
  };
}
