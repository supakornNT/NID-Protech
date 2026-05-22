"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword } from "@/lib/form-utils";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export const pageLimit = 10;

export type PermissionTeamListApiItem = {
  id: number;
  name: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  assignedPermissionCount: number;
};

export type PermissionTeamListApiResponse = {
  items: PermissionTeamListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PermissionApiItem = {
  id: number;
  code: string;
  name: string;
  assigned: boolean;
};

export type TeamPermissionDetailApiResponse = {
  team: {
    id: number;
    name: string;
    status: string;
  };
  sections: PermissionSectionApiItem[];
};

export type PermissionSectionApiItem = {
  id: string;
  title: string;
  className?: string;
  items: PermissionApiItem[];
};

export type PermissionTeamTableRow = {
  id: number;
  order: number;
  teamName: string;
  status: string;
  assignedPermissionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PermissionEditDialogValue = {
  id: number;
  teamName: string;
  status: string;
  permissionIds: number[];
  sections: PermissionSectionApiItem[];
} | null;

const sectionTitleMap: Record<string, string> = {
  screening: "คัดกรอง",
  report: "รายงาน",
  tracking: "ติดตามงาน",
  operation: "ปฏิบัติงาน",
  assignment: "มอบหมายงาน",
  management: "จัดการระบบ",
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useTeamPermissionsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rows, setRows] = useState<PermissionTeamTableRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<PermissionEditDialogValue>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildListUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageLimit),
    });

    const normalizedSearch = normalizeSearchKeyword(appliedSearch);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    return `${apiBaseUrl}/admin/teams?${params.toString()}`;
  }, [appliedSearch, page]);

  const applyListResult = useCallback((result: PermissionTeamListApiResponse) => {
    setRows(
      result.items.map((item, index) => ({
        id: item.id,
        order:
          (result.pagination.page - 1) *
            result.pagination.limit +
          index +
          1,
        teamName: item.name,
        status: item.status,
        assignedPermissionCount: item.assignedPermissionCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    );
    setTotalItems(result.pagination.total);
    setTotalPages(
      Math.max(result.pagination.totalPages, 1),
    );
    setError(null);
  }, []);

  const fetchTeams = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(buildListUrl(), {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load teams (${response.status})`);
      }

      applyListResult((await response.json()) as PermissionTeamListApiResponse);
    } catch (fetchError) {
      if (isAbortError(fetchError)) {
        return;
      }
      setError("ไม่สามารถโหลดข้อมูลทีมได้");
    } finally {
      setLoading(false);
    }
  }, [applyListResult, buildListUrl]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      setLoading(true);

      try {
        const response = await fetch(buildListUrl(), {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load teams (${response.status})`);
        }

        const result = (await response.json()) as PermissionTeamListApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        applyListResult(result);
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return;
        }
        setError("ไม่สามารถโหลดข้อมูลทีมได้");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [applyListResult, buildListUrl]);

  const openEditDialog = useCallback(
    async (teamId: number) => {
      try {
        setDialogLoading(true);
        setError(null);

        const response =
          await fetch(
            `${apiBaseUrl}/admin/teams/${teamId}/permissions`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load team permissions (${response.status})`,
          );
        }

        const result =
          (await response.json()) as TeamPermissionDetailApiResponse;

        setDialogState({
          id: result.team.id,
          teamName: result.team.name,
          status: result.team.status,
          permissionIds: result.sections
            .flatMap((section) => section.items)
            .filter((permission) => permission.assigned)
            .map((permission) => permission.id),
          sections: result.sections.map((section) => ({
            ...section,
            title:
              sectionTitleMap[section.id] ??
              section.title,
          })),
        });
      } catch (fetchError) {
        setError("ไม่สามารถโหลดข้อมูลสิทธิ์ของทีมได้");
      } finally {
        setDialogLoading(false);
      }
    },
    [],
  );

  async function submitDialog(
    nextValue: NonNullable<PermissionEditDialogValue>,
  ) {
    try {
      setSaving(true);
      setError(null);

      const permissionsResponse = await fetch(
        `${apiBaseUrl}/admin/teams/${nextValue.id}/permissions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextValue.status,
            permissionIds: nextValue.permissionIds,
          }),
        },
      );

      if (!permissionsResponse.ok) {
        throw new Error(
          `Failed to update team permissions (${permissionsResponse.status})`,
        );
      }

      setDialogState(null);
      await fetchTeams();
    } catch (submitError) {
      setError("ไม่สามารถบันทึกสิทธิ์ของทีมได้");
    } finally {
      setSaving(false);
    }
  }

  function search(nextSearchValue?: string) {
    setAppliedSearch(
      normalizeSearchKeyword(nextSearchValue ?? searchValue),
    );
    setPage(1);
  }

  return {
    pageLimit,
    page,
    setPage,
    searchValue,
    setSearchValue,
    rows,
    totalItems,
    totalPages,
    loading,
    error,
    dialogState,
    setDialogState,
    dialogLoading,
    saving,
    search,
    openEditDialog,
    submitDialog,
  };
}
