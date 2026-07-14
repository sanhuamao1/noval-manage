"use client";

import { useState, useEffect } from "react";
import { AddButton, SimpleCard, CardList } from "@/components/ui";
import { renderSections, renderOptions } from "@/lib/configs/render-utils";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";
import { EyeOff } from "lucide-react";
import type { PolishSampleData } from "@/types";
import type { DrawerProps } from "./types";

interface Props {
  onDrawerChange: (props: DrawerProps | null) => void;
}

export function PolishSampleList({ onDrawerChange }: Props) {
  const samples = useAppStore((s) => s.polishSamples);
  const mutate = useAppStore((s) => s.mutate);
  const { fields, sections, defaults, fieldsMap } = getEntry(ConfigEntity.POLISH_SAMPLE);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorConfig, setEditorConfig] = useState<any>(defaults);

  useEffect(() => {
    if (!mode) {
      onDrawerChange(null);
      return;
    }
    const title = mode === "create" ? "新建样本" : "编辑样本";
    onDrawerChange({
      title,
      onCreate: mode === "create" ? saveSample : undefined,
      onUpdate: mode === "edit" ? saveSample : undefined,
      children: <div className="space-y-4">{renderSections(sections, editorConfig, setEditorConfig)}</div>,
      onClose: () => { setMode(null); setEditingId(null); },
    });
  }, [mode, editorConfig]);

  async function saveSample() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;
    await mutate("", "polishSamples", async () => {
      if (mode === "create") {
        return await api({
          url: "/api/polish/samples",
          method: "POST",
          data: { ...editorConfig, name },
        });
      }
      if (mode === "edit" && editingId) {
        return await api({
          url: "/api/polish/samples",
          method: "PUT",
          data: { id: editingId, ...editorConfig, name },
        });
      }
    });
    setMode(null);
    setEditingId(null);
  }

  async function deleteSample(sampleId: string) {
    if (!confirm("确定要删除吗？")) return;
    await mutate("", "polishSamples", async () => {
      await api({ url: `/api/polish/samples?id=${sampleId}`, method: "DELETE" });
    });
    if (editingId === sampleId) { setMode(null); setEditingId(null); }
  }

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(defaults);
  }

  function openEdit(item: PolishSampleData) {
    setMode("edit");
    setEditingId(item.id);
    setEditorConfig(fillConfig(item, defaults, fields));
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">风格样本</h2>
        <AddButton onClick={openCreate} />
      </div>
      <CardList emptyText="还没有风格样本，请先创建">
        {samples.map((sample) => {
          const isNegative = !!sample.isNegative;
          return (
            <SimpleCard
              key={sample.id}
              title={sample.name}
              description={sample.prompt || null}
              selected={editingId === sample.id}
              onClick={() => openEdit(sample)}
              onDelete={() => deleteSample(sample.id)}
            >
              <div className="mt-1 flex items-center gap-2">
                {renderOptions(fieldsMap.sceneType.options, sample.sceneType)}
                {isNegative && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive">
                    <EyeOff className="h-2.5 w-2.5" />
                    反例
                  </span>
                )}
                {sample.useCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    已使用 {sample.useCount} 次
                  </span>
                )}
              </div>
              {sample.text && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{sample.text}</p>
              )}
            </SimpleCard>
          );
        })}
      </CardList>
    </section>
  );
}