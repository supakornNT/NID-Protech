"use client";

import * as React from "react";

type TableToolbarProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export function TableToolbar({ left, center, right }: TableToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-4">{left}</div>
      <div className="flex flex-wrap items-center gap-4">{center}</div>
      <div className="flex flex-wrap items-center gap-4 lg:ml-auto">
        {right}
      </div>
    </div>
  );
}