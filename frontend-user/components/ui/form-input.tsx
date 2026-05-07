import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormInputProps {
  label: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  value?: string;
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
  onChange,
}: FormInputProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p style={{ fontSize: 16, fontWeight: 500 }}>{label}</p>
      <Input className={inputClassName} placeholder={placeholder} value={value} onChange={onChange} />
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
}: FormInputIconProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p style={{ fontSize: 16, fontWeight: 500 }}>{label}</p>
      <div className="flex items-center border-1 border-gray-300 rounded-md px-3 gap-2 h-9 bg-transparent">
        {icon}
        <Input type={type} className={cn("border-0 shadow-none focus-visible:ring-0 p-0 h-full flex-1", inputClassName)} placeholder={placeholder} value={value} onChange={onChange} />
        {suffix}
      </div>
    </div>
  );
}
