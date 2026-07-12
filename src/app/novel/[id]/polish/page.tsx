"use client"

import { useState, useEffect } from "react"
import { AddButton, SlidingDrawer, PageLayout, SimpleCard, CardList, Tag } from "@/components/ui"
import { Sparkles, EyeOff } from "lucide-react"
import { renderSections, ConfigBadges, buildConfigTags, resolveIcon } from "@/lib/configs/render-utils"
import { findOptionInConfig, PolishRuleConfig } from "@/lib/configs/generated"
import type { OptionColor } from "@/lib/configs/config-utils"
import { getEntry, fillConfig, ConfigEntity } from "@/lib/configs/config-registry"
import type { PolishRule, PolishSample } from "@/types/polish"
import { api } from "@/lib/api"

export default function PolishPage() {
  const [rules, setRules] = useState<PolishRule[]>([])
  const [samples, setSamples] = useState<PolishSample[]>([])
  const [mode, setMode] = useState<"create" | "edit" | null>(null)
  const [editingType, setEditingType] = useState<"rule" | "sample">("rule")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorConfig, setEditorConfig] = useState<Record<string, unknown>>({})

  const { sections: ruleSections, defaults: ruleDefaults } = getEntry(ConfigEntity.POLISH_RULE)
  const { sections: sampleSections, defaults: sampleDefaults } = getEntry(ConfigEntity.POLISH_SAMPLE)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [rulesData, samplesData] = await Promise.all([
      api<PolishRule[]>({ url: "/api/polish/rules" }),
      api<PolishSample[]>({ url: "/api/polish/samples" }),
    ])
    setRules(rulesData)
    setSamples(samplesData)
  }

  function openForEdit(type: "rule" | "sample", item: PolishRule | PolishSample) {
    setEditingType(type)
    setMode("edit")
    setEditingId(item.id)
    // 从注册表获取字段定义和默认值，只填充合法字段
    setEditorConfig(
      type === "rule"
        ? fillConfig(ConfigEntity.POLISH_RULE, item as unknown as Record<string, unknown>) as Record<string, unknown>
        : fillConfig(ConfigEntity.POLISH_SAMPLE, item as unknown as Record<string, unknown>) as Record<string, unknown>,
    )
  }

  function startCreate(type: "rule" | "sample") {
    setEditingType(type)
    setMode("create")
    setEditingId(null)
    setEditorConfig(
      type === "rule"
        ? ruleDefaults as Record<string, unknown>
        : sampleDefaults as Record<string, unknown>,
    )
  }

  async function saveRule() {
    const name = String(editorConfig.name ?? "").trim()
    if (!name) return
    const description = String(editorConfig.description ?? "").trim() || null
    const prompt = String(editorConfig.prompt ?? "")
    const { id: _, createdAt: __, updatedAt: ___, useCount: ____, type: _____, ...config } = editorConfig

    try {
      if (mode === "create") {
        await api({
          url: "/api/polish/rules",
          method: "POST",
          data: { name, description, prompt, ...config },
        })
      } else if (mode === "edit" && editingId) {
        await api({
          url: "/api/polish/rules",
          method: "PUT",
          data: { id: editingId, name, description, prompt, ...config },
        })
      }
      fetchAll()
      setMode(null)
      setEditingId(null)
    } catch { /* silently ignore */ }
  }

  async function saveSample() {
    const name = String(editorConfig.name ?? "").trim()
    const prompt = String(editorConfig.prompt ?? "")
    const text = String(editorConfig.text ?? "")
    if (!name.trim() || !text.trim()) return

    const { id: _, createdAt: __, updatedAt: ___, useCount: ____, type: _____, ...config } = editorConfig
    try {
      if (mode === "create") {
        await api({
          url: "/api/polish/samples",
          method: "POST",
          data: { name, prompt, ...config },
        })
      } else if (mode === "edit" && editingId) {
        await api({
          url: "/api/polish/samples",
          method: "PUT",
          data: { id: editingId, name, prompt, ...config },
        })
      }
      fetchAll()
      setMode(null)
      setEditingId(null)
    } catch { /* silently ignore */ }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("确定要删除吗？")) return
    await api({ url: `/api/polish/rules?id=${ruleId}`, method: "DELETE" })
    if (editingId === ruleId) {
      setMode(null)
      setEditingId(null)
    }
    fetchAll()
  }

  async function deleteSample(sampleId: string) {
    if (!confirm("确定要删除吗？")) return
    await api({ url: `/api/polish/samples?id=${sampleId}`, method: "DELETE" })
    if (editingId === sampleId) {
      setMode(null)
      setEditingId(null)
    }
    fetchAll()
  }

  const editingRule = editingId && editingType === "rule"
    ? rules.find((r) => r.id === editingId) ?? null
    : null

  const editingSample = editingId && editingType === "sample"
    ? samples.find((s) => s.id === editingId) ?? null
    : null

  const drawerTitle = editingType === "rule"
    ? (mode === "create" ? "新建规则" : "编辑规则")
    : (mode === "create" ? "新建样本" : "编辑样本")

  return (
    <PageLayout
      drawer={
        <SlidingDrawer
          open={mode !== null}
          onClose={() => { setMode(null); setEditingId(null) }}
          title={
            <>
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold">{drawerTitle}</h2>
            </>
          }
          onCreate={mode === "create" ? (editingType === "rule" ? saveRule : saveSample) : undefined}
          onUpdate={mode === "edit" ? (editingType === "rule" ? saveRule : saveSample) : undefined}
        >
          {editingType === "rule" && (
            <div className="space-y-4">
              {renderSections(ruleSections, editorConfig, setEditorConfig)}
            </div>
          )}
          {editingType === "sample" && (
            <div className="space-y-4">
              {renderSections(sampleSections, editorConfig, setEditorConfig)}
            </div>
          )}
        </SlidingDrawer>
      }
    >
      {/* ─── 润色规则 ─── */}
      <section>
        <div className="flex items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold">润色规则</h2>
          <AddButton onClick={() => startCreate("rule")} />
        </div>
        <CardList
          emptyText="还没有润色规则，请先创建"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {rules.map((rule) => {
            const cfg = fillConfig(ConfigEntity.POLISH_RULE, rule as unknown as Record<string, unknown>)
            return (
              <SimpleCard
                key={rule.id}
                title={rule.name}
                description={rule.description}
                selected={editingId === rule.id && editingType === "rule"}
                onClick={() => openForEdit("rule", rule)}
                onDelete={() => deleteRule(rule.id)}
              >
                <ConfigBadges
                  tags={buildConfigTags<PolishRuleConfig>(cfg, [
                    ["情绪/氛围", "mood"],
                    ["叙事手法", "narrative"],
                    ["五感", "senses"],
                    ["人物描写", "character"],
                    ["环境描写", "environment"],
                  ])}
                />
                {rule.useCount > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    已使用 {rule.useCount} 次
                  </span>
                )}
              </SimpleCard>
            )
          })}
        </CardList>
      </section>

      {/* ─── 风格样本 ─── */}
      <section>
        <div className="flex items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold">风格样本</h2>
          <AddButton onClick={() => startCreate("sample")} />
        </div>
        <CardList
          emptyText="还没有风格样本，请先创建"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {samples.map((sample) => {
            const cfg = fillConfig(ConfigEntity.POLISH_SAMPLE, sample as unknown as Record<string, unknown>)
            const sceneType = cfg.sceneType || ""
            const isNegative = !!cfg.isNegative
            return (
              <SimpleCard
                key={sample.id}
                title={sample.name}
                description={sample.prompt || null}
                selected={editingId === sample.id && editingType === "sample"}
                onClick={() => openForEdit("sample", sample)}
                onDelete={() => deleteSample(sample.id)}
              >
                <div className="mt-1 flex items-center gap-2">
                  {sceneType && (() => {
                    const opt = findOptionInConfig(ConfigEntity.POLISH_SAMPLE, sceneType)
                    return (
                      <Tag icon={resolveIcon(opt?.icon)} color={(opt?.color as OptionColor) ?? "default"}>
                        {sceneType}
                      </Tag>
                    )
                  })()}
                  {isNegative && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive">
                      <EyeOff className="w-2.5 h-2.5" />
                      反例
                    </span>
                  )}
                  {sample.useCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      已使用 {sample.useCount} 次
                    </span>
                  )}
                </div>
                {cfg.text && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cfg.text}</p>
                )}
              </SimpleCard>
            )
          })}
        </CardList>
      </section>
    </PageLayout>
  )
}
