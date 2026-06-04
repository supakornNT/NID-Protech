import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormInputProps {
  label: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  type?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FormInputIconProps extends FormInputProps {
  icon: ReactNode;
  suffix?: ReactNode;
  type?: string;
}

export function FormInput({
  label,
  placeholder,
  className,
  inputClassName,
  value,
  disabled,
  maxLength,
  type,
  required,
  onChange,
}: FormInputProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p style={{ fontSize: 16, fontWeight: 500 }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <Input
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        type={type}
        {...(value !== undefined
          ? { value, onChange: onChange ?? (() => {}) }
          : {})}
      />
    </div>
  );
}

export function FormInputIcon({
  label,
  placeholder,
  className,
  inputClassName,
  value,
  onChange,
  icon,
  suffix,
  type = "text",
  required,
}: FormInputIconProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p style={{ fontSize: 16, fontWeight: 500 }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="flex items-center border-1 border-gray-300 rounded-md px-3 gap-2 h-9 bg-white">
        {icon}
        <Input
          type={type}
          className={cn(
            "border-0 shadow-none focus-visible:ring-0 p-0 h-full flex-1 [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden",
            inputClassName,
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {suffix}
      </div>
    </div>
  );
}
