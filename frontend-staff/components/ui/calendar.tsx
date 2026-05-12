"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type CalendarProps = {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
};

function formatDateValue(date?: Date): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function Calendar({ className, selected, onSelect }: CalendarProps) {
  return (
    <input
      type="date"
      className={cn(
        "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
        className,
      )}
      value={formatDateValue(selected)}
      onChange={(event) => onSelect?.(parseDateValue(event.target.value))}
    />
  );
}

type CalendarDayButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function CalendarDayButton({
  className,
  children,
  ...props
}: CalendarDayButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Calendar, CalendarDayButton };
