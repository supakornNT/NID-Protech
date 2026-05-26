"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, KeyRound, Pencil } from "lucide-react";

import {
  ActionSuccessModal,
  type ManagementSuccessAction,
} from "@/components/admin/action-success-modal";
import { StatusBadge } from "@/components/admin/admin-table-page";
import { ProTechSearchBar } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import { UserDetailModal } from "@/components/users/user-detail-modal";
import { UserPasswordModal } from "@/components/users/user-password-modal";
import {
  useUsersManagement,
  type UserListApiItem,
  type UserStatusFilter,
  type UserTypeFilter,
} from "@/hooks/users/use-users-management";
import { formatCitizenId, formatPhoneNumber } from "@/lib/utils";
import type { Column } from "@/types/table";

type UserTabKey = "staff" | "customer";

type StaffTableRow = {
  id: number;
  order: number;
  fullName: string;
  email: string;
  phone: string;
  citizenId: string;
  status: string;
};

type CustomerTableRow = {
  id: number;
  order: number;
  fullName: string;
  email: string;
  phone: string;
  customerType: string;
  organizationName: string;
  status: string;
};

function renderStatus(status: string) {
  if (status === "active") {
    return <StatusBadge label="ใช้งาน" tone="success" />;
  }

  if (status === "approved") {
    return <StatusBadge label="อนุมัติแล้ว" tone="success" />;
  }

  if (status === "pending") {
    return <StatusBadge label="รออนุมัติ" tone="neutral" />;
  }

  if (status === "rejected") {
    return <StatusBadge label="ปฏิเสธ" tone="danger" />;
  }

  if (status === "inactive") {
    return <StatusBadge label="ไม่ใช้งาน" tone="danger" />;
  }

  return <StatusBadge label={status} tone="neutral" />;
}

function mapCustomerTypeLabel(value: string | null) {
  if (value === "person") {
    return "บุคคล";
  }

  if (value === "company") {
    return "องค์กร";
  }

  return value || "-";
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserTabKey>("staff");
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [selectedDetailUser, setSelectedDetailUser] =
    useState<UserListApiItem | null>(null);
  const [selectedPasswordUser, setSelectedPasswordUser] =
    useState<UserListApiItem | null>(null);
  const [successAction, setSuccessAction] =
    useState<ManagementSuccessAction | null>(null);

  const activeUserTypeFilter: UserTypeFilter =
    activeTab === "staff" ? "staff" : "customer";

  const {
    items,
    pagination,
    prefixOptions,
    loading,
    saving,
    error,
    clearError,
    updateUser,
    sendPasswordOtp,
    resetPassword,
  } = useUsersManagement({
    page,
    search: appliedSearch,
    statusFilter,
    userTypeFilter: activeUserTypeFilter,
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearError();
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearError, error]);

  const staffRows = useMemo<StaffTableRow[]>(
    () =>
      items.map((item, index) => ({
        id: item.id,
        order: (pagination.page - 1) * pagination.limit + index + 1,
        fullName: item.fullName || "-",
        email: item.email || "-",
        phone: formatPhoneNumber(item.phone) || item.phone || "-",
        citizenId: formatCitizenId(item.citizenId) || item.citizenId || "-",
        status: item.status,
      })),
    [items, pagination.limit, pagination.page],
  );

  const customerRows = useMemo<CustomerTableRow[]>(
    () =>
      items.map((item, index) => ({
        id: item.id,
        order: (pagination.page - 1) * pagination.limit + index + 1,
        fullName: item.fullName || "-",
        email: item.email || "-",
        phone: formatPhoneNumber(item.phone) || item.phone || "-",
        customerType: mapCustomerTypeLabel(item.customerType),
        organizationName: item.organizationName || "-",
        status: item.status,
      })),
    [items, pagination.limit, pagination.page],
  );

  const staffColumns: Column<StaffTableRow>[] = [
    { key: "order", title: "ลำดับ", className: "w-[84px] text-lg font-medium" },
    { key: "fullName", title: "ชื่อ-นามสกุล", className: "min-w-[220px] text-lg font-medium" },
    { key: "email", title: "อีเมล", className: "min-w-[220px] text-lg font-medium" },
    { key: "phone", title: "เบอร์โทร", className: "w-[140px] text-lg font-medium" },
    { key: "citizenId", title: "เลขบัตรประชาชน", className: "w-[190px] text-lg font-medium" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[120px] text-lg font-medium",
      render: (value) => renderStatus(String(value)),
    },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[140px] text-lg font-medium",
      render: (_, row) => {
        const currentItem = items.find(
          (item) => item.id === row.id && item.userType === "staff",
        );

        if (!currentItem) {
          return null;
        }

        return (
          <div className="flex items-center justify-center gap-3 text-[#2F66C5]">
            <button
              type="button"
              className="transition hover:opacity-75"
              title="ดูรายละเอียดและแก้ไขข้อมูล"
              onClick={() => {
                setSelectedDetailUser(currentItem);
              }}
            >
              <Pencil size={20} />
            </button>
            <button
              type="button"
              className="text-[#D1435B] transition hover:opacity-75"
              title="เปลี่ยนรหัสผ่าน"
              onClick={() => {
                setSelectedPasswordUser(currentItem);
              }}
            >
              <KeyRound size={20} />
            </button>
          </div>
        );
      },
    },
  ];

  const customerColumns: Column<CustomerTableRow>[] = [
    { key: "order", title: "ลำดับ", className: "w-[84px] text-lg font-medium" },
    { key: "fullName", title: "ชื่อ-นามสกุล", className: "min-w-[220px] text-lg font-medium" },
    { key: "email", title: "อีเมล", className: "min-w-[220px] text-lg font-medium" },
    { key: "phone", title: "เบอร์โทร", className: "w-[140px] text-lg font-medium" },
    { key: "customerType", title: "ประเภทลูกค้า", className: "w-[140px] text-lg font-medium" },
    { key: "organizationName", title: "องค์กร", className: "min-w-[180px] text-lg font-medium" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[120px] text-lg font-medium",
      render: (value) => renderStatus(String(value)),
    },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[140px] text-lg font-medium",
      render: (_, row) => {
        const currentItem = items.find(
          (item) => item.id === row.id && item.userType === "customer",
        );

        if (!currentItem) {
          return null;
        }

        return (
          <div className="flex items-center justify-center gap-3 text-[#2F66C5]">
            <button
              type="button"
              className="transition hover:opacity-75"
              title="ดูรายละเอียดและแก้ไขข้อมูล"
              onClick={() => {
                setSelectedDetailUser(currentItem);
              }}
            >
              <Pencil size={20} />
            </button>
            <button
              type="button"
              className="text-[#D1435B] transition hover:opacity-75"
              title="เปลี่ยนรหัสผ่าน"
              onClick={() => {
                setSelectedPasswordUser(currentItem);
              }}
            >
              <KeyRound size={20} />
            </button>
          </div>
        );
      },
    },
  ];

  const searchPlaceholder =
    activeTab === "staff"
      ? "ชื่อเจ้าหน้าที่ อีเมล เบอร์โทร เลขบัตรประชาชน"
      : "ค้นหาลูกค้า อีเมล เบอร์โทร เลขบัตรประชาชน";

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            จัดการข้อมูลผู้ใช้งาน
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            จัดการรายละเอียดผู้ใช้งานทั้งเจ้าหน้าที่และลูกค้า พร้อมเปลี่ยนรหัสผ่านผ่าน
            OTP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative inline-flex items-end gap-8 px-3 pb-2">
            <span className="absolute inset-x-0 bottom-0 h-px bg-[#111827]" />
            <button
              type="button"
              className={`relative pb-1 pt-1 text-[16px] font-medium transition-colors duration-150 ${
                activeTab === "staff"
                  ? "text-[#3F73BB]"
                  : "text-[#111827] hover:text-[#3F73BB]"
              }`}
              onClick={() => {
                setActiveTab("staff");
                setPage(1);
                setStatusFilter("all");
                setSearchValue("");
                setAppliedSearch("");
              }}
            >
              เจ้าหน้าที่
              {activeTab === "staff" ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#3F73BB]" />
              ) : null}
            </button>
            <button
              type="button"
              className={`relative pb-1 pt-1 text-[16px] font-medium transition-colors duration-150 ${
                activeTab === "customer"
                  ? "text-[#3F73BB]"
                  : "text-[#111827] hover:text-[#3F73BB]"
              }`}
              onClick={() => {
                setActiveTab("customer");
                setPage(1);
                setStatusFilter("all");
                setSearchValue("");
                setAppliedSearch("");
              }}
            >
              ลูกค้า
              {activeTab === "customer" ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#3F73BB]" />
              ) : null}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <ProTechSearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder={searchPlaceholder}
              onSearch={(value) => {
                setSearchValue(value);
                setAppliedSearch(value);
                setPage(1);
              }}
              inputProps={{
                type: "search",
                inputMode: "search",
                autoComplete: "off",
                maxLength: 255,
                title: searchPlaceholder,
              }}
              inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
            />

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as UserStatusFilter);
                  setPage(1);
                }}
                className="h-[31px] min-w-[132px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
              >
                <option value="all">สถานะทั้งหมด</option>
                {activeTab === "staff" ? (
                  <>
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </>
                ) : (
                  <>
                    <option value="approved">อนุมัติแล้ว</option>
                    <option value="pending">รออนุมัติ</option>
                    <option value="rejected">ปฏิเสธ</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="max-w-[460px] rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#8B95A7]">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
        ) : activeTab === "staff" ? (
          <ProTechTable
            columns={staffColumns}
            data={staffRows}
            limit={pagination.limit}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={setPage}
          />
        ) : (
          <ProTechTable
            columns={customerColumns}
            data={customerRows}
            limit={pagination.limit}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={setPage}
          />
        )}

        {selectedDetailUser ? (
          <UserDetailModal
            key={`detail-${selectedDetailUser.userType}-${selectedDetailUser.id}-${selectedDetailUser.updatedAt ?? "none"}`}
            open={selectedDetailUser !== null}
            saving={saving}
            user={selectedDetailUser}
            prefixOptions={prefixOptions}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedDetailUser(null);
              }
            }}
            onSubmit={(value) => {
              void (async () => {
                const success = await updateUser(selectedDetailUser.id, {
                  ...value,
                  userType: selectedDetailUser.userType,
                });

                if (!success) {
                  return;
                }

                setSelectedDetailUser(null);
                setSuccessAction("update");
              })();
            }}
          />
        ) : null}

        {selectedPasswordUser ? (
          <UserPasswordModal
            key={`password-${selectedPasswordUser.userType}-${selectedPasswordUser.id}-${selectedPasswordUser.updatedAt ?? "none"}`}
            open={selectedPasswordUser !== null}
            saving={saving}
            user={selectedPasswordUser}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedPasswordUser(null);
              }
            }}
            onSendOtp={() => sendPasswordOtp(selectedPasswordUser)}
            onSubmit={(password, otp) =>
              resetPassword(selectedPasswordUser, password, otp)
            }
          />
        ) : null}

        <ActionSuccessModal
          open={successAction !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSuccessAction(null);
            }
          }}
          action={successAction ?? "update"}
          subject="ข้อมูลผู้ใช้งาน"
        />
      </div>
    </div>
  );
}
