"use client";

import type { CSSProperties, ReactNode } from "react";

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
  contentClassName?: string;
  contentStyle?: CSSProperties;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
};

export function AdminModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClassName = "max-w-[520px]",
  contentClassName,
  contentStyle,
  bodyClassName,
  headerClassName,
  titleClassName,
}: AdminModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={contentStyle}
        className={`w-[calc(100%-2rem)] sm:w-full ${widthClassName} ${contentClassName ?? ""} rounded-[16px] border border-[#3F73BB] bg-white p-0 shadow-[0_10px_24px_rgba(47,102,197,0.18)]`}
      >
        <div className={bodyClassName ?? "px-4 sm:px-6 py-5"}>
          <DialogHeader className={headerClassName ?? "mb-5 text-center"}>
            <DialogTitle
              className={
                titleClassName ??
                "text-[24px] font-bold normal-case tracking-normal text-[#3F73BB]"
              }
            >
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
