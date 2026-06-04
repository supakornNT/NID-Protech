"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type ToolbarSelectProps = {
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Toolbar filter select built on ShadCN Select (Radix UI).
 * Arrow rotates correctly on open/close via data-state.
 */
export function ToolbarSelect({
  value,
  options,
  placeholder,
  onChange,
  className,
}: ToolbarSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          // Size & layout
          "h-[31px] min-w-[124px] w-auto rounded-md px-3 text-[14px]",
          // Colors matching existing design
          "border-[#A8B1C2] bg-white text-[#6B7280]",
          // Remove default focus ring, use subtle one instead
          "focus-visible:ring-1 focus-visible:ring-[#A8B1C2] focus-visible:ring-offset-0",
          // Chevron rotation — Radix sets data-[state=open] on trigger
          "[&_svg]:text-[#8B95A7] [&_svg]:transition-transform [&_svg]:duration-200",
          "data-[state=open]:[&_svg]:rotate-180",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="z-50 min-w-[--radix-select-trigger-width] rounded-md border border-[#E5E7EB] bg-white shadow-lg"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer text-[14px] text-[#374151] focus:bg-[#EEF2FF] focus:text-[#3F73BB]"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
