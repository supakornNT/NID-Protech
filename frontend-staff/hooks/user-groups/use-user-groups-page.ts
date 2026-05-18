"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UserGroupTabKey = "groups" | "members";
export type StatusFilter = "all" | "active" | "inactive";
export type MemberGroupFilter = "all" | "with-group" | "without-group";

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

export type GroupRow = {
  id: number;
  order: number;
  checked: boolean;
  groupName: string;
  status: string;
  memberCount: number;
};

export type MemberMembership = {
  id: number;
  teamId: number;
  teamName: string;
};

export type MemberRow = {
  id: number;
  order: number;
  fullName: string;
  email: string;
  teams: string[];
  status: string;
  teamIds: number[];
  memberships: MemberMembership[];
};

export type GroupFormValue = {
  id?: number;
  name: string;
  status: "active" | "inactive";
};

export type MemberFormValue = {
  staffId: number | null;
  teamIds: number[];
};

type Option = {
  value: number;
  label: string;
};

type MemberManagementResponse = {
  items: Array<{
    id: number;
    fullName: string;
    email: string;
    status: string;
    teams: string[];
    teamIds: number[];
    memberships: MemberMembership[];
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
    staffs: Option[];
  };
};

type GroupDialogState =
  | {
      mode: "create" | "edit";
      value: GroupFormValue;
    }
  | null;

type MemberDialogState =
  | {
      mode: "create" | "edit";
      staffName: string;
      memberships: MemberMembership[];
      value: MemberFormValue;
    }
  | null;

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
  const [teams, setTeams] = useState<TeamApiItem[]>([]);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [memberTotalItems, setMemberTotalItems] = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [staffOptions, setStaffOptions] = useState<Option[]>([]);
  const [memberTeamOptions, setMemberTeamOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupDialogState, setGroupDialogState] =
    useState<GroupDialogState>(null);
  const [memberDialogState, setMemberDialogState] =
    useState<MemberDialogState>(null);

  const loadGroupsData = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/admin/teams?page=1&limit=100`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load teams (${response.status})`);
    }

    const result = (await response.json()) as TeamListResponse;
    setTeams(result.items);
  }, []);

  const loadMembersData = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(memberPage),
      limit: "10",
    });

    if (appliedSearch.trim()) {
      params.set("search", normalizeSearchKeyword(appliedSearch));
    }

    if (teamFilter !== "all") {
      params.set("teamId", String(teamFilter));
    }

    if (memberGroupFilter !== "all") {
      params.set("groupFilter", memberGroupFilter);
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/teams/member-management?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to load member management (${response.status})`);
    }

    const result = (await response.json()) as MemberManagementResponse;

    setMemberRows(
      result.items.map((item, index) => ({
        id: item.id,
        order: (result.pagination.page - 1) * result.pagination.limit + index + 1,
        fullName: item.fullName,
        email: item.email,
        teams: item.teams,
        status: item.status,
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
  }, [appliedSearch, memberGroupFilter, memberPage, teamFilter]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (activeTab === "groups") {
        await loadGroupsData();
      } else {
        await loadMembersData();
      }

      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError("ไม่สามารถโหลดข้อมูลกลุ่มผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadGroupsData, loadMembersData]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadData]);

  const membershipsByTeamId = useMemo(() => {
    const result = new Map<number, Set<number>>();

    for (const member of memberRows) {
      for (const membership of member.memberships) {
        const current = result.get(membership.teamId) ?? new Set<number>();
        current.add(member.id);
        result.set(membership.teamId, current);
      }
    }

    return result;
  }, [memberRows]);

  const groupRows = useMemo<GroupRow[]>(() => {
    const normalizedSearch = normalizeSearchKeyword(appliedSearch).toLowerCase();

    const filtered = teams.filter((team) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        team.name.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        groupStatusFilter === "all" || team.status === groupStatusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.map((team, index) => ({
      id: team.id,
      order: index + 1,
      checked: team.id === selectedGroupId,
      groupName: team.name,
      status: team.status,
      memberCount: membershipsByTeamId.get(team.id)?.size ?? 0,
    }));
  }, [
    appliedSearch,
    groupStatusFilter,
    membershipsByTeamId,
    selectedGroupId,
    teams,
  ]);

  const groupTotalItems = groupRows.length;
  const groupTotalPages = Math.max(1, Math.ceil(groupTotalItems / 10));
  const pagedGroupRows = useMemo(() => {
    const safePage = Math.min(Math.max(groupPage, 1), groupTotalPages);
    const startIndex = (safePage - 1) * 10;
    return groupRows.slice(startIndex, startIndex + 10);
  }, [groupPage, groupRows, groupTotalPages]);

  const activeTeamOptions = activeTab === "members" ? memberTeamOptions : teams.map((team) => ({
    value: team.id,
    label: team.status === "inactive" ? `${team.name} (ปิดใช้งาน)` : team.name,
  }));

  function search() {
    setAppliedSearch(searchValue);
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
    const team = teams.find((item) => item.id === groupId);

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

  async function submitGroupDialog(value: GroupFormValue) {
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
            "ไม่สามารถบันทึกข้อมูลกลุ่มผู้ใช้งานได้",
          ),
        );
      }

      setGroupDialogState(null);
      await loadGroupsData();
      if (activeTab === "members") {
        await loadMembersData();
      }
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกข้อมูลกลุ่มผู้ใช้งานได้",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedGroup() {
    if (selectedGroupId === null) {
      return;
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
            "ไม่สามารถลบกลุ่มผู้ใช้งานได้",
          ),
        );
      }

      setSelectedGroupId(null);
      await loadGroupsData();
      if (activeTab === "members") {
        await loadMembersData();
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "ไม่สามารถลบกลุ่มผู้ใช้งานได้",
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

  async function submitMemberDialog(value: MemberFormValue) {
    if (!value.staffId) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const currentMemberships = memberDialogState?.memberships ?? [];
      const currentByTeamId = new Map(
        currentMemberships.map((item) => [item.teamId, item]),
      );
      const nextTeamIdSet = new Set(value.teamIds);

      for (const currentMembership of currentMemberships) {
        if (!nextTeamIdSet.has(currentMembership.teamId)) {
          const deleteResponse = await fetch(
            `${API_BASE_URL}/admin/staff-team-roles/${currentMembership.id}`,
            {
              method: "DELETE",
            },
          );

          if (!deleteResponse.ok) {
            throw new Error(
              await getResponseErrorMessage(
                deleteResponse,
                "ไม่สามารถลบคนออกจากกลุ่มได้",
              ),
            );
          }
        }
      }

      for (const teamId of value.teamIds) {
        if (currentByTeamId.has(teamId)) {
          continue;
        }

        const createResponse = await fetch(
          `${API_BASE_URL}/admin/staff-team-roles`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              staffId: value.staffId,
              teamId,
              roleId: null,
            }),
          },
        );

        if (!createResponse.ok) {
          throw new Error(
            await getResponseErrorMessage(
              createResponse,
              "ไม่สามารถเพิ่มคนเข้ากลุ่มได้",
            ),
          );
        }
      }

      setMemberDialogState(null);
      await loadMembersData();
      await loadGroupsData();
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกข้อมูลคนในกลุ่มได้",
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
    groupRows: pagedGroupRows,
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
