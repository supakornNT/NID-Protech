"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const GROUP_PAGE_LIMIT = 10;
const MEMBER_PAGE_LIMIT = 10;

export type UserGroupTabKey = "groups" | "members";
export type StatusFilter = "all" | "active" | "inactive";
export type MemberGroupFilter = "all" | "with-group" | "without-group";

export type UserGroupListApiItem = {
  id: number;
  name: string;
  status: string;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UserGroupListApiResponse = {
  items: UserGroupListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserGroupTableRow = {
  id: number;
  order: number;
  checked: boolean;
  groupName: string;
  status: string;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UserGroupMembershipApiItem = {
  id: number;
  teamId: number;
  teamName: string;
};

export type UserGroupMemberTableRow = {
  id: number;
  order: number;
  fullName: string;
  email: string;
  teams: string[];
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  teamIds: number[];
  memberships: UserGroupMembershipApiItem[];
};

export type UserGroupFormInput = {
  id?: number;
  name: string;
  status: "active" | "inactive";
};

export type UserGroupMemberFormInput = {
  staffId: number | null;
  teamIds: number[];
};

type SelectOption = {
  value: number;
  label: string;
};

type UserGroupMemberManagementApiResponse = {
  items: Array<{
    id: number;
    fullName: string;
    email: string;
    status: string;
    createdAt: string | null;
    updatedAt: string | null;
    teams: string[];
    teamIds: number[];
    memberships: UserGroupMembershipApiItem[];
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filterOptions: {
    teams: Array<{
      value: number;
      label: string;
      status: string;
    }>;
    staffs: SelectOption[];
  };
};

type GroupDialogState =
  | {
      mode: "create" | "edit";
      value: UserGroupFormInput;
    }
  | null;

type MemberDialogState =
  | {
      mode: "create" | "edit";
      staffName: string;
      memberships: UserGroupMembershipApiItem[];
      value: UserGroupMemberFormInput;
    }
  | null;

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

async function getResponseErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const result = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (Array.isArray(result?.message)) {
    return result.message[0] || fallbackMessage;
  }

  if (typeof result?.message === "string" && result.message.trim()) {
    return result.message;
  }

  return fallbackMessage;
}

export function useUserGroupsPage() {
  const [activeTab, setActiveTab] = useState<UserGroupTabKey>("groups");
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [groupStatusFilter, setGroupStatusFilter] =
    useState<StatusFilter>("all");
  const [teamFilter, setTeamFilter] = useState<number | "all">("all");
  const [memberGroupFilter, setMemberGroupFilter] =
    useState<MemberGroupFilter>("all");
  const [groupPage, setGroupPage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupItems, setGroupItems] = useState<UserGroupListApiItem[]>([]);
  const [groupTotalItems, setGroupTotalItems] = useState(0);
  const [groupTotalPages, setGroupTotalPages] = useState(1);
  const [memberRows, setMemberRows] = useState<UserGroupMemberTableRow[]>([]);
  const [memberTotalItems, setMemberTotalItems] = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [staffOptions, setStaffOptions] = useState<SelectOption[]>([]);
  const [memberTeamOptions, setMemberTeamOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupDialogState, setGroupDialogState] =
    useState<GroupDialogState>(null);
  const [memberDialogState, setMemberDialogState] =
    useState<MemberDialogState>(null);

  const buildGroupListUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(groupPage),
      limit: String(GROUP_PAGE_LIMIT),
    });
    const normalizedSearch = normalizeSearchKeyword(appliedSearch);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    if (groupStatusFilter !== "all") {
      params.set("status", groupStatusFilter);
    }

    return `${API_BASE_URL}/admin/teams/table?${params.toString()}`;
  }, [appliedSearch, groupPage, groupStatusFilter]);

  const buildMemberListUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(memberPage),
      limit: String(MEMBER_PAGE_LIMIT),
    });

    const normalizedSearch = normalizeSearchKeyword(appliedSearch);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    if (teamFilter !== "all") {
      params.set("teamId", String(teamFilter));
    }

    if (memberGroupFilter !== "all") {
      params.set("groupFilter", memberGroupFilter);
    }

    return `${API_BASE_URL}/admin/teams/member-management?${params.toString()}`;
  }, [appliedSearch, memberGroupFilter, memberPage, teamFilter]);

  const applyGroupResult = useCallback((result: UserGroupListApiResponse) => {
    setGroupItems(result.items);
    setGroupTotalItems(result.pagination.total);
    setGroupTotalPages(Math.max(1, result.pagination.totalPages));
    setError(null);
  }, []);

  const applyMemberResult = useCallback((result: UserGroupMemberManagementApiResponse) => {
    setMemberRows(
      result.items.map((item, index) => ({
        id: item.id,
        order: (result.pagination.page - 1) * result.pagination.limit + index + 1,
        fullName: item.fullName,
        email: item.email,
        teams: item.teams,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        teamIds: item.teamIds,
        memberships: item.memberships,
      })),
    );
    setMemberTotalItems(result.pagination.total);
    setMemberTotalPages(Math.max(1, result.pagination.totalPages));
    setStaffOptions(result.filterOptions.staffs);
    setMemberTeamOptions(
      result.filterOptions.teams.map((team) => ({
        value: team.value,
        label:
          team.status === "inactive" ? `${team.label} (ปิดใช้งาน)` : team.label,
      })),
    );
    setError(null);
  }, []);

  const loadGroupsData = useCallback(async () => {
    const response = await fetch(buildGroupListUrl(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load teams (${response.status})`);
    }

    applyGroupResult((await response.json()) as UserGroupListApiResponse);
  }, [applyGroupResult, buildGroupListUrl]);

  const loadMembersData = useCallback(async () => {
    const response = await fetch(buildMemberListUrl(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load member management (${response.status})`);
    }

    applyMemberResult((await response.json()) as UserGroupMemberManagementApiResponse);
  }, [applyMemberResult, buildMemberListUrl]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);

        if (activeTab === "groups") {
          const response = await fetch(buildGroupListUrl(), {
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to load teams (${response.status})`);
          }

          const result = (await response.json()) as UserGroupListApiResponse;

          if (controller.signal.aborted) {
            return;
          }

          applyGroupResult(result);
        } else {
          const response = await fetch(buildMemberListUrl(), {
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Failed to load member management (${response.status})`);
          }

          const result = (await response.json()) as UserGroupMemberManagementApiResponse;

          if (controller.signal.aborted) {
            return;
          }

          applyMemberResult(result);
        }
      } catch (loadError) {
        if (isAbortError(loadError)) {
          return;
        }
        setError("ไม่สามารถโหลดข้อมูลการจัดการกลุ่มผู้ใช้ได้");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [activeTab, applyGroupResult, applyMemberResult, buildGroupListUrl, buildMemberListUrl]);

  const groupRows = useMemo<UserGroupTableRow[]>(
    () =>
      groupItems.map((team, index) => ({
        id: team.id,
        order: (groupPage - 1) * GROUP_PAGE_LIMIT + index + 1,
        checked: team.id === selectedGroupId,
        groupName: team.name,
        status: team.status,
        memberCount: team.memberCount,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      })),
    [groupItems, groupPage, selectedGroupId],
  );

  const activeTeamOptions = useMemo(
    () => memberTeamOptions,
    [memberTeamOptions],
  );

  function search(nextSearchValue?: string) {
    setAppliedSearch(normalizeSearchKeyword(nextSearchValue ?? searchValue));
    setGroupPage(1);
    setMemberPage(1);
    setSelectedGroupId(null);
  }

  function openCreateGroupDialog() {
    setGroupDialogState({
      mode: "create",
      value: {
        name: "",
        status: "active",
      },
    });
  }

  function openEditGroupDialog(groupId: number) {
    const team = groupItems.find((item) => item.id === groupId);

    if (!team) {
      return;
    }

    setGroupDialogState({
      mode: "edit",
      value: {
        id: team.id,
        name: team.name,
        status: team.status === "inactive" ? "inactive" : "active",
      },
    });
  }

  async function submitGroupDialog(value: UserGroupFormInput) {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: normalizeTextInput(value.name),
        status: value.status,
      };

      const response =
        groupDialogState?.mode === "edit" && value.id
          ? await fetch(`${API_BASE_URL}/admin/teams/${value.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            })
          : await fetch(`${API_BASE_URL}/admin/teams`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถบันทึกข้อมูลกลุ่มผู้ใช้ได้",
          ),
        );
      }

      setGroupDialogState(null);
      await loadGroupsData();
      if (activeTab === "members") {
        await loadMembersData();
      }
      return true;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกข้อมูลกลุ่มผู้ใช้ได้",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedGroup() {
    if (selectedGroupId === null) {
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/admin/teams/${selectedGroupId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถลบข้อมูลกลุ่มผู้ใช้ได้",
          ),
        );
      }

      setSelectedGroupId(null);
      await loadGroupsData();
      if (activeTab === "members") {
        await loadMembersData();
      }
      return true;
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "ไม่สามารถลบข้อมูลกลุ่มผู้ใช้ได้",
      );
    } finally {
      setSaving(false);
    }
  }

  function openCreateMemberDialog() {
    setMemberDialogState({
      mode: "create",
      staffName: "",
      memberships: [],
      value: {
        staffId: null,
        teamIds: [],
      },
    });
  }

  function openEditMemberDialog(staffId: number) {
    const member = memberRows.find((item) => item.id === staffId);

    if (!member) {
      return;
    }

    setMemberDialogState({
      mode: "edit",
      staffName: member.fullName,
      memberships: member.memberships,
      value: {
        staffId,
        teamIds: member.teamIds,
      },
    });
  }

  async function submitMemberDialog(value: UserGroupMemberFormInput) {
    if (!value.staffId) {
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admin/staff-team-roles/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: value.staffId,
          teamIds: value.teamIds,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถบันทึกข้อมูลสมาชิกกลุ่มได้",
          ),
        );
      }

      setMemberDialogState(null);
      await Promise.all([loadMembersData(), loadGroupsData()]);
      return true;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกข้อมูลสมาชิกกลุ่มได้",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    activeTab,
    setActiveTab,
    searchValue,
    setSearchValue,
    groupStatusFilter,
    setGroupStatusFilter,
    teamFilter,
    setTeamFilter,
    memberGroupFilter,
    setMemberGroupFilter,
    groupPage,
    setGroupPage,
    memberPage,
    setMemberPage,
    selectedGroupId,
    setSelectedGroupId,
    groupRows,
    groupTotalItems,
    groupTotalPages,
    memberRows,
    memberTotalItems,
    memberTotalPages,
    loading,
    saving,
    error,
    groupDialogState,
    setGroupDialogState,
    memberDialogState,
    setMemberDialogState,
    staffOptions,
    activeTeamOptions,
    search,
    openCreateGroupDialog,
    openEditGroupDialog,
    submitGroupDialog,
    deleteSelectedGroup,
    openCreateMemberDialog,
    openEditMemberDialog,
    submitMemberDialog,
  };
}
