"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TABLE_LIMIT = 10;

export type UserGroupTabKey = "groups" | "members";
export type StatusFilter = "all" | "active" | "inactive";

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

export type StaffApiItem = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  status: string;
};

export type RoleApiItem = {
  id: number;
  name: string;
};

export type StaffTeamRoleApiItem = {
  id: number;
  staff_id: number;
  staff_name: string;
  team_id: number;
  team_name: string;
  role_id: number;
  role_name: string;
};

export type GroupRow = {
  id: number;
  order: number;
  checked: boolean;
  groupName: string;
  status: string;
  memberCount: number;
};

export type MemberRow = {
  id: number;
  order: number;
  fullName: string;
  email: string;
  teams: string[];
  status: string;
  teamIds: number[];
  roleId: number | null;
};

export type GroupFormValue = {
  id?: number;
  name: string;
  status: "active" | "inactive";
};

export type MemberFormValue = {
  staffId: number | null;
  teamIds: number[];
  roleId: number | null;
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
      value: MemberFormValue;
    }
  | null;

function paginateRows<T>(rows: T[], page: number) {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * TABLE_LIMIT;

  return {
    page: safePage,
    totalItems,
    totalPages,
    items: rows.slice(startIndex, startIndex + TABLE_LIMIT),
  };
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
  const [groupPage, setGroupPage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [teams, setTeams] = useState<TeamApiItem[]>([]);
  const [staffs, setStaffs] = useState<StaffApiItem[]>([]);
  const [roles, setRoles] = useState<RoleApiItem[]>([]);
  const [staffTeamRoles, setStaffTeamRoles] = useState<StaffTeamRoleApiItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupDialogState, setGroupDialogState] =
    useState<GroupDialogState>(null);
  const [memberDialogState, setMemberDialogState] =
    useState<MemberDialogState>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [teamsResponse, staffsResponse, rolesResponse, teamRolesResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/admin/teams?page=1&limit=100`, {
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/admin/staffs`, {
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/admin/roles`, {
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/admin/staff-team-roles`, {
            cache: "no-store",
          }),
        ]);

      if (!teamsResponse.ok) {
        throw new Error(`Failed to load teams (${teamsResponse.status})`);
      }

      if (!staffsResponse.ok) {
        throw new Error(`Failed to load staffs (${staffsResponse.status})`);
      }

      if (!rolesResponse.ok) {
        throw new Error(`Failed to load roles (${rolesResponse.status})`);
      }

      if (!teamRolesResponse.ok) {
        throw new Error(
          `Failed to load staff team roles (${teamRolesResponse.status})`,
        );
      }

      const teamsResult = (await teamsResponse.json()) as TeamListResponse;
      const staffsResult = (await staffsResponse.json()) as StaffApiItem[];
      const rolesResult = (await rolesResponse.json()) as RoleApiItem[];
      const teamRolesResult =
        (await teamRolesResponse.json()) as StaffTeamRoleApiItem[];

      setTeams(teamsResult.items);
      setStaffs(staffsResult);
      setRoles(rolesResult);
      setStaffTeamRoles(teamRolesResult);
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError("ไม่สามารถโหลดข้อมูลกลุ่มผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }, []);

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

    for (const item of staffTeamRoles) {
      const current = result.get(item.team_id) ?? new Set<number>();
      current.add(item.staff_id);
      result.set(item.team_id, current);
    }

    return result;
  }, [staffTeamRoles]);

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
  }, [appliedSearch, groupStatusFilter, membershipsByTeamId, selectedGroupId, teams]);

  const memberRows = useMemo<MemberRow[]>(() => {
    const normalizedSearch = normalizeSearchKeyword(appliedSearch).toLowerCase();
    const membershipsByStaffId = new Map<number, StaffTeamRoleApiItem[]>();

    for (const item of staffTeamRoles) {
      const current = membershipsByStaffId.get(item.staff_id) ?? [];
      current.push(item);
      membershipsByStaffId.set(item.staff_id, current);
    }

    const filtered = staffs.filter((staff) => {
      const fullName = `${staff.name} ${staff.surname}`.trim();
      const memberships = membershipsByStaffId.get(staff.id) ?? [];
      const teamNames = memberships.map((item) => item.team_name);

      return (
        normalizedSearch.length === 0 ||
        fullName.toLowerCase().includes(normalizedSearch) ||
        staff.email.toLowerCase().includes(normalizedSearch) ||
        teamNames.some((teamName) =>
          teamName.toLowerCase().includes(normalizedSearch),
        )
      );
    });

    return filtered.map((staff, index) => {
      const memberships = membershipsByStaffId.get(staff.id) ?? [];
      const uniqueTeams = Array.from(
        new Map(
          memberships.map((item) => [item.team_id, item.team_name]),
        ).values(),
      );

      return {
        id: staff.id,
        order: index + 1,
        fullName: `${staff.name} ${staff.surname}`.trim(),
        email: staff.email,
        teams: uniqueTeams,
        status: staff.status,
        teamIds: Array.from(new Set(memberships.map((item) => item.team_id))),
        roleId: memberships[0]?.role_id ?? roles[0]?.id ?? null,
      };
    });
  }, [appliedSearch, roles, staffs, staffTeamRoles]);

  const pagedGroups = useMemo(
    () => paginateRows(groupRows, groupPage),
    [groupPage, groupRows],
  );
  const pagedMembers = useMemo(
    () => paginateRows(memberRows, memberPage),
    [memberPage, memberRows],
  );

  const activeTeamOptions = useMemo(
    () =>
      teams.map((team) => ({
        value: team.id,
        label:
          team.status === "inactive"
            ? `${team.name} (ปิดใช้งาน)`
            : team.name,
      })),
    [teams],
  );

  const staffOptions = useMemo(
    () =>
      staffs.map((staff) => ({
        value: staff.id,
        label: `${staff.name} ${staff.surname}`.trim(),
      })),
    [staffs],
  );

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
      await loadData();
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

      const response = await fetch(`${API_BASE_URL}/admin/teams/${selectedGroupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถลบกลุ่มผู้ใช้งานได้",
          ),
        );
      }

      setSelectedGroupId(null);
      await loadData();
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
      value: {
        staffId: null,
        teamIds: [],
        roleId: roles[0]?.id ?? null,
      },
    });
  }

  function openEditMemberDialog(staffId: number) {
    const staff = staffs.find((item) => item.id === staffId);

    if (!staff) {
      return;
    }

    const memberships = staffTeamRoles.filter((item) => item.staff_id === staffId);

    setMemberDialogState({
      mode: "edit",
      staffName: `${staff.name} ${staff.surname}`.trim(),
      value: {
        staffId,
        teamIds: Array.from(new Set(memberships.map((item) => item.team_id))),
        roleId: memberships[0]?.role_id ?? roles[0]?.id ?? null,
      },
    });
  }

  async function submitMemberDialog(value: MemberFormValue) {
    if (!value.staffId || !value.roleId) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const currentMemberships = staffTeamRoles.filter(
        (item) => item.staff_id === value.staffId,
      );
      const currentByTeamId = new Map(
        currentMemberships.map((item) => [item.team_id, item]),
      );
      const nextTeamIdSet = new Set(value.teamIds);

      for (const currentMembership of currentMemberships) {
        if (!nextTeamIdSet.has(currentMembership.team_id)) {
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

          continue;
        }

        if (currentMembership.role_id !== value.roleId) {
          const patchResponse = await fetch(
            `${API_BASE_URL}/admin/staff-team-roles/${currentMembership.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                roleId: value.roleId,
              }),
            },
          );

          if (!patchResponse.ok) {
            throw new Error(
              await getResponseErrorMessage(
                patchResponse,
                "ไม่สามารถอัปเดตข้อมูลคนในกลุ่มได้",
              ),
            );
          }
        }
      }

      for (const teamId of value.teamIds) {
        if (currentByTeamId.has(teamId)) {
          continue;
        }

        const createResponse = await fetch(`${API_BASE_URL}/admin/staff-team-roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            staffId: value.staffId,
            teamId,
            roleId: value.roleId,
          }),
        });

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
      await loadData();
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
    groupPage: pagedGroups.page,
    setGroupPage,
    memberPage: pagedMembers.page,
    setMemberPage,
    selectedGroupId,
    setSelectedGroupId,
    groupRows: pagedGroups.items,
    groupTotalItems: pagedGroups.totalItems,
    groupTotalPages: pagedGroups.totalPages,
    memberRows: pagedMembers.items,
    memberTotalItems: pagedMembers.totalItems,
    memberTotalPages: pagedMembers.totalPages,
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
