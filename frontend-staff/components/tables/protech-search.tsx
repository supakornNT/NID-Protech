"use client";

import * as React from "react";
import { ProTechButton } from "@/components/tables/protech-button";

type ProTechSearchProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
};

type ProTechSearchBarProps = {
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  onSearch?: (value: string) => void;
};

export function ProTechSearch({
  value,
  onChange,
  placeholder = "",
  icon,
  className = "",
  inputClassName = "",
}: ProTechSearchProps) {
  return (
    <div className={`relative min-w-0 flex-1 sm:w-[200px] sm:flex-none ${className}`}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          h-8 w-full rounded-md border border-gray-400 bg-white
          px-3 pr-9 text-sm outline-none
          ${inputClassName}
        `}
      />

      {icon && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-black">
          {icon}
        </div>
      )}
    </div>
  );
}

export function ProTechSearchBar({
  defaultValue = "",
  placeholder = "",
  icon,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  buttonLabel = "ค้นหา",
  onSearch,
}: ProTechSearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <ProTechSearch
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        icon={icon}
        className="w-[200px] flex-none"
        inputClassName={inputClassName}
      />
      <ProTechButton
        variant="primary"
        className={`h-[31px] min-w-[74px] px-4 text-[14px] ${buttonClassName}`}
        onClick={() => onSearch?.(value)}
      >
        {buttonLabel}
      </ProTechButton>
    </div>
  );
}
