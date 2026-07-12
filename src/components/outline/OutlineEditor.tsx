"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { renderSections } from "@/lib/configs/render-utils";
import { getSections, ConfigEntity } from "@/lib/configs/config-registry";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export interface OutlineEditorHandle {
  getData: () => { config: Record<string, unknown> };
}

interface OutlineEditorProps {
  novelId: string;
  outlineId?: string | null;
  initialConfig: Record<string, unknown>;
}

export const OutlineEditor = forwardRef<OutlineEditorHandle, OutlineEditorProps>(
  function OutlineEditor({ novelId, outlineId, initialConfig }, ref) {
    const [config, setConfig] = useState<Record<string, unknown>>(initialConfig);
    const [keyEvents, setKeyEvents] = useState<{ id: string; title: string }[]>([]);
    const [newKeTitle, setNewKeTitle] = useState("");

    useEffect(() => {
      if (!outlineId) { setKeyEvents([]); return; }
      api<{ id: string; title: string }[]>({ url: `/api/key-events?outlineId=${outlineId}` })
        .then(setKeyEvents)
        .catch(() => setKeyEvents([]));
    }, [outlineId]);

    useImperativeHandle(
      ref,
      (): OutlineEditorHandle => ({
        getData: () => ({ config }),
      }),
      [config],
    );

    return (
      <div className="space-y-6">
        {renderSections(getSections(ConfigEntity.OUTLINE), config, setConfig, novelId)}

        {/* ── 关键事件管理 ── */}
        <div className="rounded-lg border border-border-subtle p-4">
          <h3 className="text-sm font-semibold mb-3">关键事件</h3>
          {keyEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground mb-3">暂无关键事件</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {keyEvents.map((ke) => (
                <li key={ke.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50">
                  <span>{ke.title}</span>
                  <button onClick={() => {
                    api({ url: `/api/key-events?id=${ke.id}`, method: "DELETE" });
                    setKeyEvents((prev) => prev.filter((k) => k.id !== ke.id));
                  }} className="text-destructive hover:opacity-70">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {outlineId && (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-transparent border border-border-subtle rounded px-2 py-1 text-sm outline-none focus:border-amber-500"
                placeholder="输入关键事件..."
                value={newKeTitle}
                onChange={(e) => setNewKeTitle(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newKeTitle.trim() && outlineId) {
                    const created = await api<{ id: string; title: string }>({
                      url: "/api/key-events",
                      method: "POST",
                      data: { outlineId, title: newKeTitle.trim() },
                    });
                    setKeyEvents((prev) => [...prev, created]);
                    setNewKeTitle("");
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (!newKeTitle.trim() || !outlineId) return;
                  const created = await api<{ id: string; title: string }>({
                    url: "/api/key-events",
                    method: "POST",
                    data: { outlineId, title: newKeTitle.trim() },
                  });
                  setKeyEvents((prev) => [...prev, created]);
                  setNewKeTitle("");
                }}
                className="text-amber-400 hover:opacity-70"
                disabled={!newKeTitle.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
