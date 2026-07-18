"use client";

import { useState, useRef, useEffect } from "react";
import { useEntityItems, type EntityItemBase } from "@/hooks/useEntityItems";
import { Plus, X, Search, Loader2 } from "lucide-react";

interface TagSelectProps {
  label: string;
  entity: string;
  novelId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  optionValue?: string;
  optionLabel?: string;
}

export function TagSelect({
  entity,
  novelId,
  selectedIds,
  onChange,
  placeholder = "搜索或创建...",
  optionValue = "id",
  optionLabel = "name",
}: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { items, createFn } = useEntityItems(entity);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setInput("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const getId = (item: EntityItemBase) => String(item[optionValue] ?? "");
  const getName = (item: EntityItemBase) => String(item[optionLabel] ?? "");

  const selectedNames = selectedIds
    .map((id) => items.find((o) => getId(o) === id))
    .filter((v): v is EntityItemBase => !!v);

  const filtered = input.trim()
    ? items.filter(
        (o) =>
          getName(o).includes(input.trim()) &&
          !selectedIds.includes(getId(o)),
      )
    : items.filter((o) => !selectedIds.includes(getId(o)));

  async function handleCreate() {
    const name = input.trim();
    if (!name || creating || !createFn) return;
    setCreating(true);
    try {
      const created = await createFn(novelId, name);
      onChange([...selectedIds, getId(created)]);
      setInput("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  function handleSelect(item: EntityItemBase) {
    onChange([...selectedIds, getId(item)]);
    setInput("");
    setOpen(false);
  }

  function handleRemove(id: string) {
    onChange(selectedIds.filter((v) => v !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        handleSelect(filtered[0]);
      } else if (input.trim()) {
        handleCreate();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setInput("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 标签展示区 */}
      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
        {selectedNames.map((item) => (
          <span
            key={getId(item)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20"
          >
            {getName(item)}
            <button
              type="button"
              onClick={() => handleRemove(getId(item))}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-border-subtle text-muted-foreground hover:border-amber-500 hover:text-amber-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* 搜索/创建面板 */}
      {open && (
        <div className="rounded-lg border border-border-subtle bg-bg-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-1 px-2 border-b border-border-subtle">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={getId(opt)}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
                >
                  {getName(opt)}
                </button>
              ))
            ) : input.trim() ? (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full text-left px-3 py-1.5 text-sm text-amber-400 hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                {creating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>创建 "{input.trim()}"</span>
              </button>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">输入名称搜索或创建</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
