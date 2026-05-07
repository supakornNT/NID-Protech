import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps {
  label: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function FormInput({
  label,
  placeholder,
  className,
  inputClassName,
}: FormInputProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label>{label}</Label>
      <Input className={inputClassName} placeholder={placeholder} />
    </div>
  );
}
