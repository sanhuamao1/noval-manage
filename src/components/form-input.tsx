import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormInputProps {
    label: string;
    icon?: LucideIcon;
    placeholder?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    [key: string]: any;
}

export function FormInput({
    label,
    icon,
    placeholder,
    value,
    onChange,
    className,
    ...props
}: FormInputProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <Label icon={icon}>{label}</Label>
            <Input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-bg-850 border-border-subtle rounded-md focus-visible:ring-0 focus-visible:border-primary"
                {...props}
            />
        </div>
    );
}
