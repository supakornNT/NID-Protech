"use client";

import { useCallback, useEffect, useState } from "react";

import {
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";

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
  permissions: PermissionApiItem[];
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
  tracking: "การติดตาม",
  operation: "การปฏิบัติงาน",
  assignment: "การพิจารณา",
  admin: "การจัดการ",
};

function buildPermissionSections(
  permissions: PermissionApiItem[],
): PermissionSection[] {
  const grouped = new Map<
    string,
    PermissionApiItem[]
  >();

  for (const permission of permissions) {
    const prefix =
      permission.code.split(".")[0];

    const current =
      grouped.get(prefix) ?? [];

    current.push(permission);

    grouped.set(prefix, current);
  }

  return Array.from(grouped.entries()).map(
    ([prefix, items]) => ({
      id: prefix,
      title:
        sectionTitleMap[prefix] ??
        prefix,
      items,
    }),
  );
}

export function useTeamPermissionsPage() {
  const [page, setPage] = useState(1);

  const [searchValue, setSearchValue] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [rows, setRows] = useState<
    PermissionTableRow[]
  >([]);

  const [totalItems, setTotalItems] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [dialogState, setDialogState] =
    useState<EditDialogState>(null);

  const [dialogLoading, setDialogLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageLimit),
    });

    const normalizedSearch =
      normalizeSearchKeyword(
        appliedSearch,
      );

    if (normalizedSearch) {
      params.set(
        "search",
        normalizedSearch,
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/admin/teams?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load teams (${response.status})`,
      );
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

    setTotalItems(
      result.pagination.total,
    );

    setTotalPages(
      Math.max(
        result.pagination.totalPages,
        1,
      ),
    );

    setError(null);

    setLoading(false);
  }, [appliedSearch, page]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        await fetchTeams();
      } catch (fetchError) {
        console.error(fetchError);

        if (active) {
          setError(
            "ไม่สามารถโหลดข้อมูลสิทธิ์ผู้ใช้งานจำแนกตามกลุ่มได้",
          );

          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
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
          teamName:
            result.team.name,
          status:
            result.team.status,
          permissionIds:
            result.permissions
              .filter(
                (permission) =>
                  permission.assigned,
              )
              .map(
                (permission) =>
                  permission.id,
              ),
          sections:
            buildPermissionSections(
              result.permissions,
            ),
        });
      } catch (fetchError) {
        console.error(fetchError);

        setError(
          "ไม่สามารถโหลดรายละเอียดสิทธิ์ของทีมได้",
        );
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

      const normalizedTeamName =
        normalizeTextInput(
          nextValue.teamName,
        );

      const response = await fetch(
        `${apiBaseUrl}/admin/teams/${nextValue.id}/permissions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: normalizedTeamName,
            status:
              nextValue.status,
            permissionIds:
              nextValue.permissionIds,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update team permissions (${response.status})`,
        );
      }

      setDialogState(null);

      await fetchTeams();
    } catch (submitError) {
      console.error(submitError);

      setError(
        "ไม่สามารถบันทึกสิทธิ์ของทีมได้",
      );
    } finally {
      setSaving(false);
    }
  }

  function search() {
    setAppliedSearch(
      normalizeSearchKeyword(
        searchValue,
      ),
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