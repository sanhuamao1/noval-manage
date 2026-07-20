"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Tag } from "@/components/ui/tag";

interface TagsProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function Tags({ value = [], onChange, placeholder = "输入..." }: TagsProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function startAdd() {
    setAdding(true);
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange([...value, trimmed]);
    }
    setDraft("");
    setAdding(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setDraft("");
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((tag, index) => (
        <Tag key={index} className="group">
          {tag}
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="hidden opacity-50 transition-opacity hover:opacity-100 group-hover:inline-flex"
          >
            <X className="h-3 w-3" />
          </button>
        </Tag>
      ))}

      {adding ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-20 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
        />
      ) : (
        <button
          type="button"
          onClick={startAdd}
          className="border-border-subtle inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
