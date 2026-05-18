"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeSearchKeyword } from "@/lib/form-utils";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export const pageLimit = 10;

export type TeamApiItem = {
  id: number;
  name: string;
  status: string;
  createdAt?: string | null;
};

export type TeamListResponse = {
  items: TeamApiItem[];
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

export type TeamPermissionDetailResponse = {
  team: {
    id: number;
    name: string;
    status: string;
  };
  sections: PermissionSection[];
};

export type PermissionSection = {
  id: string;
  title: string;
  className?: string;
  items: PermissionApiItem[];
};

export type PermissionTableRow = {
  id: number;
  order: number;
  teamName: string;
};

export type EditDialogState = {
  id: number;
  teamName: string;
  status: string;
  permissionIds: number[];
  sections: PermissionSection[];
} | null;

const sectionTitleMap: Record<string, string> = {
  screening: "รับเรื่องและคัดกรอง",
  report: "รายงาน",
  tracking: "การติดตาม",
  operation: "การปฏิบัติงาน",
  assignment: "การพิจารณา",
  management: "การจัดการ",
};

export function useTeamPermissionsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rows, setRows] = useState<PermissionTableRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<EditDialogState>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageLimit),
      });

      const normalizedSearch = normalizeSearchKeyword(appliedSearch);

      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }

      const response = await fetch(
        `${apiBaseUrl}/admin/teams?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load teams (${response.status})`);
      }

      const result =
        (await response.json()) as TeamListResponse;

      setRows(
        result.items.map((item, index) => ({
          id: item.id,
          order:
            (result.pagination.page - 1) *
              result.pagination.limit +
            index +
            1,
          teamName: item.name,
        })),
      );
      setTotalItems(result.pagination.total);
      setTotalPages(
        Math.max(result.pagination.totalPages, 1),
      );
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลกลุ่มผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTeams();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchTeams]);

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
          (await response.json()) as TeamPermissionDetailResponse;

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
        console.error(fetchError);
        setError("ไม่สามารถโหลดข้อมูลสิทธิ์ของกลุ่มได้");
      } finally {
        setDialogLoading(false);
      }
    },
    [],
  );

  async function submitDialog(
    nextValue: NonNullable<EditDialogState>,
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
      console.error(submitError);
      setError("ไม่สามารถบันทึกข้อมูลกลุ่มผู้ใช้งานได้");
    } finally {
      setSaving(false);
    }
  }

  function search() {
    setAppliedSearch(
      normalizeSearchKeyword(searchValue),
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
