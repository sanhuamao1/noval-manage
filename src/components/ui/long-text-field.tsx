"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "./textarea";

/** 多行文本输入字段（带字数统计） */
export function LongTextField({
  value,
  maxLength,
  placeholder,
  onChange,
}: {
  value: string;
  maxLength: number;
  placeholder?: string;
  onChange: (v: string) => void;
  rootClassName?: string;
}) {
  const len = value?.length ?? 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value ?? ""}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        rows={1}
        className="min-h-[60px] resize-none overflow-hidden"
      />
      <div
        className={`absolute bottom-1.5 right-2 flex items-center rounded bg-background/80 px-1 py-0.5 text-xs ${
          len > maxLength * 0.9 ? "text-amber-500" : "text-muted-foreground"
        }`}
      >
        <span>
          {len}/{maxLength}
        </span>
      </div>
    </div>
  );
}
