"use client";

import { ReactNode } from "react";
import { Label } from "./label";

export interface FormItemProps {
    label?: string;
    children: ReactNode;
    display?: "default" | "flex" | "grid" | "between";
    handler?: ReactNode;
    flexCols?: number;
    className?: string;
}

export function FormItem({
    label,
    children,
    display = "default",
    handler,
    flexCols = 3,
    className,
}: FormItemProps) {
    // 处理 label 和 handler 的布局
    const renderLabelWithHandler = () => (
        <div className="flex items-center gap-1">
            <Label>{label}</Label>
            {handler}
        </div>
    );

    // 处理表单控件的布局
    const renderChildren = () => {
        const cx = className ? ` ${className}` : "";
        switch (display) {
            case "flex":
                return <div className={`flex flex-wrap gap-1.5${cx}`}>{children}</div>;
            case "grid":
                return (
                    <div className={`grid grid-cols-${flexCols} gap-3${cx}`}>
                        {children}
                    </div>
                );
            case "between":
                return <div className={`flex items-center${cx}`}>{children}</div>;
            default:
                return <div className={cx.trim() || undefined}>{children}</div>;
        }
    };

    return (
        <div className={["space-y-1.5", display === "between" && label ? "flex items-center justify-between" : ""].filter(Boolean).join(" ")}>
            {label && (handler ? renderLabelWithHandler() : <Label>{label}</Label>)}
            {renderChildren()}
        </div>
    );
}
