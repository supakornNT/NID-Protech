"use client";

import * as React from "react";

import { ProTechButton } from "@/components/tables/protech-button";

export type SearchInputConfig = {
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  title?: string;
};

type ProTechSearchProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  inputProps?: SearchInputConfig;
};

type ProTechSearchBarProps = {
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  onSearch?: (value: string) => void;
  inputProps?: SearchInputConfig;
  onValueChange?: (value: string) => void;
};

export function ProTechSearch({
  value,
  onChange,
  placeholder = "",
  icon,
  className = "",
  inputClassName = "",
  inputProps,
}: ProTechSearchProps) {
  return (
    <div className={`relative min-w-0 flex-1 sm:w-50 sm:flex-none ${className}`}>
      <input
        type={inputProps?.type ?? "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputProps?.inputMode}
        autoComplete={inputProps?.autoComplete}
        maxLength={inputProps?.maxLength}
        title={inputProps?.title}
        className={`
          h-8 w-full rounded-md border border-gray-400 bg-white
          px-3 pr-5 text-sm outline-none
          ${inputClassName}
        `}
      />

      {icon ? (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-black">
          {icon}
        </div>
      ) : null}
    </div>
  );
}

export function ProTechSearchBar({
  defaultValue = "",
  value,
  placeholder = "",
  icon,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  buttonLabel = "ค้นหา",
  onSearch,
  inputProps,
  onValueChange,
}: ProTechSearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  return (
    <div className={`flex gap-2 w-full sm:w-auto ${className}`}>
      <ProTechSearch
        value={resolvedValue}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (!isControlled) {
            setInternalValue(nextValue);
          }

          onValueChange?.(nextValue);
        }}
        placeholder={placeholder}
        icon={icon}
        className="flex-1 sm:flex-none sm:w-50"
        inputClassName={inputClassName}
        inputProps={inputProps}
      />
      <ProTechButton
        variant="search"
        className={`h-7.75 min-w-18.5 shrink-0 px-4 text-[14px] ${buttonClassName}`}
        onClick={() => onSearch?.(resolvedValue)}
      >
        {buttonLabel}
      </ProTechButton>
    </div>
  );
}
