"use client";

import * as React from "react";

type ProTechSearchProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
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
    <div className={`relative min-w-0 flex-1 sm:w-[220px] sm:flex-none ${className}`}>
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
