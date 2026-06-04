// components/tables/protech-button.tsx

"use client";

import * as React from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  TriangleAlert,
} from "lucide-react";

type ButtonVariant =
  | "primary"
  | "create"
  | "add"
  | "edit"
  | "delete"
  | "cancel"
  | "outline"
  | "authOutline"
  | "success"
  | "warning"
  | "danger"
  | "detail";

type ProTechButtonProps = {
  children?: React.ReactNode;

  icon?: React.ReactNode;

  iconPosition?: "left" | "right";

  type?: "button" | "submit" | "reset";

  variant?: ButtonVariant;

  disabled?: boolean;

  fullWidth?: boolean;

  className?: string;

  onClick?: () => void;
};

export function ProTechButton({
  children,
  icon,
  iconPosition = "left",
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
}: ProTechButtonProps) {
  /* =========================
     VARIANT
  ========================= */

  const variantClasses = {
    /* PRIMARY */
    primary: `
      bg-[#2F66C5]
      text-white

      hover:bg-[#2557AE]

      active:bg-[#1F4B99]
    `,

    /* CREATE */
    create: `
      bg-[#2F66C5]
      text-white

      hover:bg-[#2557AE]

      active:bg-[#1F4B99]
    `,

    /* ADD */
    add: `
      bg-[#2F66C5]
      text-white

      hover:bg-[#2557AE]

      active:bg-[#1F4B99]
    `,

    /* EDIT */
    edit: `
      bg-[#2F66C5]
      text-white

      hover:bg-[#2557AE]

      active:bg-[#1F4B99]
    `,

    /* DELETE */
    delete: `
      border
      border-gray-400

      bg-white
      text-[#2F66C5]

      hover:bg-[#EEF4FF]

      active:bg-[#DCE9FF]
    `,

    /* CANCEL */
    cancel: `
      border
      border-gray-400

      bg-white
      text-gray-700

      hover:bg-gray-100

      active:bg-gray-200
    `,

    /* OUTLINE */
    outline: `
      border
      border-[#7FA7E8]

      bg-white
      text-[#2F66C5]

      hover:bg-[#EEF4FF]

      active:bg-[#DCE9FF]
    `,

    /* AUTH OUTLINE */
    authOutline: `
      border
      border-black

      bg-white
      text-black

      hover:bg-gray-50

      active:bg-gray-100
    `,

    /* SUCCESS */
    success: `
      bg-green-600
      text-white

      hover:bg-green-700

      active:bg-green-800
    `,

    /* WARNING */
    warning: `
      bg-yellow-400
      text-black

      hover:bg-yellow-500

      active:bg-yellow-600
    `,

    /* DANGER */
    danger: `
      bg-red-500
      text-white

      hover:bg-red-600

      active:bg-red-700
    `,

    /* DETAIL */
   detail: `
  bg-gray-200
  text-gray-700

  hover:bg-gray-300

  active:bg-gray-400
`,
  };

  /* =========================
     DEFAULT ICON
  ========================= */

  const defaultIcons = {
    primary: null,

    create: <Plus size={16} />,

    add: <Plus size={16} />,

    edit: <Pencil size={16} />,

    delete: <Trash2 size={16} />,

    cancel: <X size={16} />,

    outline: null,
    authOutline: null,

    success: <Check size={16} />,

    warning: (
      <TriangleAlert size={16} />
    ),

    detail: null,
    danger: <Trash2 size={16} />,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center   gap-2 rounded-md  px-5 text-sm  font-medium
        whitespace-nowrap transition duration-150 disabled:cursor-not-allowed disabled:opacity-50

        ${
          fullWidth
            ? "w-full"
            : "w-auto"
        }

        ${variantClasses[variant]}

        ${className}
      `}
    >
      {/* ICON LEFT */}
      {(icon ||
        defaultIcons[variant]) &&
        iconPosition === "left" && (
          <span className="flex items-center">
            {icon ||
              defaultIcons[
                variant
              ]}
          </span>
        )}

      {/* TEXT */}
      {children && (
        <span>{children}</span>
      )}

      {/* ICON RIGHT */}
      {(icon ||
        defaultIcons[variant]) &&
        iconPosition === "right" && (
          <span className="flex items-center">
            {icon ||
              defaultIcons[
                variant
              ]}
          </span>
        )}
    </button>
  );
}
