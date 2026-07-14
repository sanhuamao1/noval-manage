"use client";

import { useState, useEffect } from "react";
import { AddButton, SimpleCard, CardList } from "@/components/ui";
import { renderSections } from "@/lib/configs/render-utils";
import { ConfigBadges } from "@/components/ui/config-badges";
import { getEntry, ConfigEntity } from "@/lib/configs/config-registry";
import { fillConfig } from "@/lib/configs/config-utils";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";
import type { PolishRuleConfig, PolishRuleData } from "@/types";
import type { DrawerProps } from "./types";

interface Props {
  onDrawerChange: (props: DrawerProps | null) => void;
}

export function PolishRuleList({ onDrawerChange }: Props) {
  const rules = useAppStore((s) => s.polishRules);
  const mutate = useAppStore((s) => s.mutate);
  const { fields, sections, defaults } = getEntry(ConfigEntity.POLISH_RULE);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorConfig, setEditorConfig] = useState<PolishRuleConfig>(defaults);

  useEffect(() => {
    if (!mode) {
      onDrawerChange(null);
      return;
    }
    const title = mode === "create" ? "新建规则" : "编辑规则";
    onDrawerChange({
      title: title,
      onCreate: mode === "create" ? saveRule : undefined,
      onUpdate: mode === "edit" ? saveRule : undefined,
      children: <div className="space-y-4">{renderSections(sections, editorConfig, setEditorConfig)}</div>,
      onClose: () => { setMode(null); setEditingId(null); },
    });
  }, [mode, editorConfig]);

  async function saveRule() {
    const name = String(editorConfig.name ?? "").trim();
    if (!name) return;
    await mutate("", "polishRules", async () => {
      if (mode === "create") {
        return await api({
          url: "/api/polish/rules",
          method: "POST",
          data: { ...editorConfig, name },
        });
      }
      if (mode === "edit" && editingId) {
        return await api({
          url: "/api/polish/rules",
          method: "PUT",
          data: { id: editingId, ...editorConfig, name },
        });
      }
    });
    setMode(null);
    setEditingId(null);
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("确定要删除吗？")) return;
    await mutate("", "polishRules", async () => {
      await api({ url: `/api/polish/rules?id=${ruleId}`, method: "DELETE" });
    });
    if (editingId === ruleId) { setMode(null); setEditingId(null); }
  }

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setEditorConfig(defaults);
  }

  function openEdit(item: PolishRuleData) {
    setMode("edit");
    setEditingId(item.id);
    setEditorConfig(fillConfig(item, defaults, fields) as PolishRuleConfig);
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">润色规则</h2>
        <AddButton onClick={openCreate} />
      </div>
      <CardList emptyText="还没有润色规则，请先创建">
        {rules.map((rule) => {
          const cfg = fillConfig(rule, defaults, fields);
          return (
            <SimpleCard
              key={rule.id}
              title={rule.name}
              description={rule.description}
              selected={editingId === rule.id}
              onClick={() => openEdit(rule)}
              onDelete={() => deleteRule(rule.id)}
            >
              <ConfigBadges<PolishRuleConfig>
                config={cfg}
                items={[
                  ["情绪/氛围", "mood"],
                  ["叙事手法", "narrative"],
                  ["五感", "senses"],
                  ["人物描写", "character"],
                  ["环境描写", "environment"],
                ]}
              />
              {rule.useCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  已使用 {rule.useCount} 次
                </span>
              )}
            </SimpleCard>
          );
        })}
      </CardList>
    </section>
  );
}