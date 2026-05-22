"use client";

import { useCallback, useEffect, useState } from "react";

import {
  isValidOptionalEmail,
  isValidOptionalPhone,
  keepDigitsOnly,
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UserStatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected";
export type UserTypeFilter = "all" | "staff" | "customer";

export type UserListApiItem = {
  userType: "staff" | "customer";
  id: number;
  prefixId: number | null;
  prefixName: string | null;
  name: string;
  surname: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  citizenId: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastPasswordChangedAt: string | null;
  customerType: string | null;
  organizationName: string | null;
  roleNames: string[];
  teamNames: string[];
};

type UserListApiResponse = {
  items: UserListApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UserOptionsApiResponse = {
  prefixes: Array<{
    value: number;
    label: string;
  }>;
  roles: Array<{
    value: number;
    label: string;
  }>;
};

export type UserFormInput = {
  userType: "staff" | "customer";
  prefixId: number | null;
  name: string;
  surname: string;
  email: string;
  phone: string;
  citizenId: string;
  status: string;
};

type UseUsersManagementParams = {
  page: number;
  search: string;
  statusFilter: UserStatusFilter;
  userTypeFilter: UserTypeFilter;
};

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

export function normalizeUserFormInput(value: UserFormInput): UserFormInput {
  return {
    userType: value.userType,
    prefixId: value.prefixId,
    name: normalizeTextInput(value.name),
    surname: normalizeTextInput(value.surname),
    email: normalizeTextInput(value.email).toLowerCase(),
    phone: keepDigitsOnly(value.phone),
    citizenId: keepDigitsOnly(value.citizenId),
    status: value.status,
  };
}

export function validateUserFormInput(value: UserFormInput) {
  const normalized = normalizeUserFormInput(value);

  if (!normalized.name) {
    return "กรุณากรอกชื่อ";
  }

  if (!normalized.email) {
    return "กรุณากรอกอีเมล";
  }

  if (!isValidOptionalEmail(normalized.email)) {
    return "กรุณากรอกอีเมลให้ถูกต้อง";
  }

  if (!isValidOptionalPhone(normalized.phone)) {
    return "กรุณากรอกเบอร์โทรเป็นตัวเลข 9-10 หลัก";
  }

  if (normalized.citizenId.length > 0 && normalized.citizenId.length !== 13) {
    return "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
  }

  return null;
}

export function useUsersManagement({
  page,
  search,
  statusFilter,
  userTypeFilter,
}: UseUsersManagementParams) {
  const [items, setItems] = useState<UserListApiItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [prefixOptions, setPrefixOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [roleOptions, setRoleOptions] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUsersUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });

    const normalizedSearch = normalizeSearchKeyword(search);

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (userTypeFilter !== "all") {
      params.set("userType", userTypeFilter);
    }

    return `${API_BASE_URL}/admin/staffs/users?${params.toString()}`;
  }, [page, search, statusFilter, userTypeFilter]);

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(buildUsersUrl(), {
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(
          response,
          "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        ),
      );
    }

    const result = (await response.json()) as UserListApiResponse;

    setItems(result.items);
    setPagination(result.pagination);
    setError(null);
  }, [buildUsersUrl]);

  const loadOptions = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`${API_BASE_URL}/admin/staffs/users/options`, {
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(
          response,
          "ไม่สามารถโหลดตัวเลือกผู้ใช้งานได้",
        ),
      );
    }

    const result = (await response.json()) as UserOptionsApiResponse;
    setPrefixOptions(result.prefixes);
    setRoleOptions(result.roles);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);
        await loadUsers(controller.signal);
      } catch (loadError) {
        if (isAbortError(loadError)) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [loadUsers]);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        await loadOptions(controller.signal);
      } catch (loadError) {
        if (isAbortError(loadError)) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "ไม่สามารถโหลดตัวเลือกผู้ใช้งานได้",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, [loadOptions]);

  const updateUser = useCallback(
    async (id: number, value: UserFormInput) => {
      try {
        setSaving(true);
        setError(null);

        const normalized = normalizeUserFormInput(value);
        const endpoint =
          normalized.userType === "customer"
            ? `${API_BASE_URL}/customers/${id}`
            : `${API_BASE_URL}/admin/staffs/${id}`;
        const payload =
          normalized.userType === "customer"
            ? {
                prefixId: normalized.prefixId,
                name: normalized.name,
                surname: normalized.surname,
                email: normalized.email,
                phone: normalized.phone || null,
                citizenId: normalized.citizenId || null,
                status: normalized.status,
              }
            : {
                prefixId: normalized.prefixId,
                name: normalized.name,
                surname: normalized.surname,
                email: normalized.email,
                phone: normalized.phone || null,
                citizenId: normalized.citizenId || null,
                status: normalized.status,
              };
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            await getResponseErrorMessage(
              response,
              "ไม่สามารถบันทึกข้อมูลผู้ใช้งานได้",
            ),
          );
        }

        await loadUsers();
        return true;
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "ไม่สามารถบันทึกข้อมูลผู้ใช้งานได้",
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadUsers],
  );

  const sendPasswordOtp = useCallback(async (user: UserListApiItem) => {
    try {
      setSaving(true);
      setError(null);

      const endpoint =
        user.userType === "customer"
          ? `${API_BASE_URL}/customers/${user.id}/send-password-otp`
          : `${API_BASE_URL}/admin/staffs/${user.id}/send-password-otp`;
      const response = await fetch(
        endpoint,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถส่ง OTP ได้",
          ),
        );
      }

      return { success: true as const, message: "ส่ง OTP แล้ว" };
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถส่ง OTP ได้";
      setError(message);
      return { success: false as const, message };
    } finally {
      setSaving(false);
    }
  }, []);

  const resetPassword = useCallback(async (user: UserListApiItem, password: string, otp: string) => {
    try {
      setSaving(true);
      setError(null);

      const endpoint =
        user.userType === "customer"
          ? `${API_BASE_URL}/customers/${user.id}/reset-password`
          : `${API_BASE_URL}/admin/staffs/${user.id}/reset-password`;
      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            otp,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            "ไม่สามารถเปลี่ยนรหัสผ่านได้",
          ),
        );
      }

      await loadUsers();
      return { success: true as const, message: "เปลี่ยนรหัสผ่านแล้ว" };
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถเปลี่ยนรหัสผ่านได้";
      setError(message);
      return { success: false as const, message };
    } finally {
      setSaving(false);
    }
  }, [loadUsers]);

  return {
    items,
    pagination,
    prefixOptions,
    roleOptions,
    loading,
    saving,
    error,
    clearError: () => {
      setError(null);
    },
    updateUser,
    sendPasswordOtp,
    resetPassword,
  };
}
