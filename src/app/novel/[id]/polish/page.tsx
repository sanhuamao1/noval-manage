"use client"

import { useState, useEffect, useRef } from "react"
import { AddButton } from "@/components/ui/button"
import { Sparkles, Tag, EyeOff } from "lucide-react"
import { SlidingDrawer } from "@/components/ui/drawer"
import { PageLayout } from "@/components/PageLayout"
import { PolishRuleEditor, type PolishRuleEditorHandle } from "@/components/polish/PolishRuleEditor"
import { SampleEditor, type SampleEditorHandle } from "@/components/polish/SampleEditor"
import { SimpleCard } from "@/components/ui/card"
import { CardList } from "@/components/CardList"
import { DEFAULT_POLISH_CONFIG, DEFAULT_SAMPLE_CONFIG } from "@/lib/configs/polish-defs"
import { parseConfig } from "@/lib/configs/config-utils"
import { ConfigBadges } from "@/lib/configs/render-utils"
import { buildConfigTags } from "@/lib/configs/render-utils"

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  config: string | null
  type: string
  useCount: number
}

export default function PolishPage() {
  const [allRules, setAllRules] = useState<PolishRule[]>([])
  const [mode, setMode] = useState<"create" | "edit" | null>(null)
  const [editingType, setEditingType] = useState<"rule" | "sample">("rule")
  const [editingId, setEditingId] = useState<string | null>(null)
  const ruleEditorRef = useRef<PolishRuleEditorHandle>(null)
  const sampleEditorRef = useRef<SampleEditorHandle>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const res = await fetch("/api/polish/rules")
    const data = await res.json()
    setAllRules(data)
  }

  const rules = allRules.filter((r) => r.type === "base")
  const samples = allRules.filter((r) => r.type === "sample")

  function openForEdit(type: "rule" | "sample", item: PolishRule) {
    setEditingType(type)
    setMode("edit")
    setEditingId(item.id)
  }

  function startCreate(type: "rule" | "sample") {
    setEditingType(type)
    setMode("create")
    setEditingId(null)
  }

  async function saveRule() {
    if (!ruleEditorRef.current) return
    const { name, description, prompt, config } = ruleEditorRef.current.getData()
    if (!name.trim()) return

    if (mode === "create") {
      const res = await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, prompt, config: JSON.stringify(config), type: "base" }),
      })
      if (!res.ok) return
    } else if (mode === "edit" && editingId) {
      const res = await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, description, prompt, config: JSON.stringify(config) }),
      })
      if (!res.ok) return
    }
    fetchAll()
    setMode(null)
    setEditingId(null)
  }

  async function saveSample() {
    if (!sampleEditorRef.current) return
    const { name, prompt, config } = sampleEditorRef.current.getData()
    if (!name.trim() || !config.text.trim()) return

    const configStr = JSON.stringify(config)
    if (mode === "create") {
      const res = await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt, config: configStr, type: "sample" }),
      })
      if (!res.ok) return
    } else if (mode === "edit" && editingId) {
      const res = await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, prompt, config: configStr }),
      })
      if (!res.ok) return
    }
    fetchAll()
    setMode(null)
    setEditingId(null)
  }

  async function deleteItem(ruleId: string) {
    if (!confirm("确定要删除吗？")) return
    await fetch(`/api/polish/rules?id=${ruleId}`, { method: "DELETE" })
    if (editingId === ruleId) {
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
            <PolishRuleEditor
              key={"rule-" + (editingId ?? "create")}
              ref={ruleEditorRef}
              initialName={editingRule?.name ?? ""}
              initialDescription={editingRule?.description ?? ""}
              initialPrompt={editingRule?.prompt ?? ""}
              initialConfig={editingRule ? parseConfig(editingRule.config, DEFAULT_POLISH_CONFIG) : DEFAULT_POLISH_CONFIG}
            />
          )}
          {editingType === "sample" && (
            <SampleEditor
              key={"sample-" + (editingId ?? "create")}
              ref={sampleEditorRef}
              initialName={editingSample?.name ?? ""}
              initialPrompt={editingSample?.prompt ?? ""}
              initialConfig={editingSample
                ? parseConfig(editingSample.config, DEFAULT_SAMPLE_CONFIG as any) as any
                : { scene_type: "", text: "", is_negative: false }
              }
            />
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
            const cfg = parseConfig(rule.config, DEFAULT_POLISH_CONFIG)
            return (
              <SimpleCard
                key={rule.id}
                title={rule.name}
                description={rule.description}
                selected={editingId === rule.id && editingType === "rule"}
                onClick={() => openForEdit("rule", rule)}
                onDelete={() => deleteItem(rule.id)}
              >
                <ConfigBadges
                  tags={buildConfigTags(cfg, [
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
            const cfg = parseConfig(sample.config, DEFAULT_SAMPLE_CONFIG as any) as any
            const sceneType = cfg.scene_type || ""
            const isNegative = !!cfg.is_negative
            return (
              <SimpleCard
                key={sample.id}
                title={sample.name}
                description={sample.prompt || null}
                selected={editingId === sample.id && editingType === "sample"}
                onClick={() => openForEdit("sample", sample)}
                onDelete={() => deleteItem(sample.id)}
              >
                <div className="mt-1 flex items-center gap-2">
                  {sceneType && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Tag className="w-2.5 h-2.5" />
                      {sceneType}
                    </span>
                  )}
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
