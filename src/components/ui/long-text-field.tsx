"use client";

import { Textarea } from "./textarea";
import { Label } from "./label";
import { FileText } from "lucide-react";

/** 多行文本输入字段（带字数统计） */
export function LongTextField({
    value,
    maxLength,
    placeholder,
    label,
    onChange,
}: {
    value: string;
    maxLength: number;
    placeholder?: string;
    label: string;
    onChange: (v: string) => void;
}) {
    const len = value?.length ?? 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <Label>{label}</Label>
            </div>
            <Textarea
                value={value ?? ""}
                onChange={(e) => {
                    if (e.target.value.length <= maxLength) {
                        onChange(e.target.value);
                    }
                }}
                placeholder={placeholder}
                rows={6}
            />
            <div
                className={`flex items-center justify-end text-xs ${
                    len > maxLength * 0.9
                        ? "text-amber-500"
                        : "text-muted-foreground"
                }`}
            >
                <span>
                    {len}/{maxLength}
                </span>
            </div>
        </div>
    );
}
