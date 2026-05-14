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
  value?: string;
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
}: ProTechSearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const resolvedValue = value ?? internalValue;

  React.useEffect(() => {
    if (value === undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <ProTechSearch
        value={resolvedValue}
        onChange={(event) => {
          if (value === undefined) {
            setInternalValue(event.target.value);
          }
        }}
        placeholder={placeholder}
        icon={icon}
        className="w-[200px] flex-none"
        inputClassName={inputClassName}
      />
      <ProTechButton
        variant="primary"
        className={`h-[31px] min-w-[74px] px-4 text-[14px] ${buttonClassName}`}
        onClick={() => onSearch?.(resolvedValue)}
      >
        {buttonLabel}
      </ProTechButton>
    </div>
  );
}
