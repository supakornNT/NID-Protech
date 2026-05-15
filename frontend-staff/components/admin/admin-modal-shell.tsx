"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdminModalShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  widthClassName?: string;
};

export function AdminModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClassName = "max-w-[520px]",
}: AdminModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`${widthClassName} rounded-[16px] border border-[#3F73BB] bg-white p-0 shadow-[0_10px_24px_rgba(47,102,197,0.18)]`}
      >
        <div className="px-6 py-5">
          <DialogHeader className="mb-5 text-center">
            <DialogTitle className="text-[24px] font-bold normal-case tracking-normal text-[#3F73BB]">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-[14px] text-[#6B7280]">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
