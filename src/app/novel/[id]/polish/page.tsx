"use client"

import { useState, useEffect } from "react"
import { AddButton } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, PenTool, FileText } from "lucide-react"
import { SlidingDrawer } from "@/components/ui/drawer"
import { PolishRuleConfigEditor } from "@/components/polish/PolishRuleConfigEditor"
import { FormInput } from "@/components/form-input"
import { SimpleCard } from "@/components/ui/card"
import { DEFAULT_POLISH_CONFIG, CONFIG_FIELDS } from "@/lib/configs/polish-defs"
import { buildLabelMap, buildBadgeTexts, parseConfig } from "@/lib/configs/config-utils"

/** 从 CONFIG_FIELDS 构建一次 label 查找表 */
const LABEL_MAP = buildLabelMap(CONFIG_FIELDS)

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  config: string | null
}

/** 将配置项渲染为摘要标签 */
function ConfigBadges(config: Record<string, unknown>) {
  const badges = buildBadgeTexts(config, LABEL_MAP)
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges.map((b) => (
        <span key={b} className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
          {b}
        </span>
      ))}
    </div>
  )
}

export default function PolishPage() {
  const [rules, setRules] = useState<PolishRule[]>([])
  const [mode, setMode] = useState<"create" | "edit" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    prompt: "",
    config: DEFAULT_POLISH_CONFIG,
  })

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    const res = await fetch("/api/polish/rules")
    const data = await res.json()
    setRules(data)
  }

  function openForEdit(rule: PolishRule) {
    setMode("edit")
    setEditingId(rule.id)
    setForm({
      name: rule.name,
      description: rule.description || "",
      prompt: rule.prompt,
      config: parseConfig(rule.config, DEFAULT_POLISH_CONFIG),
    })
  }

  /** 直接打开编辑区（create 模式） */
  function startCreate() {
    setMode("create")
    setEditingId(null)
    setForm({ name: "", description: "", prompt: "", config: { ...DEFAULT_POLISH_CONFIG } })
  }

  async function saveRule() {
    if (!form.name.trim()) return

    if (mode === "create") {
      const res = await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          prompt: form.prompt,
          config: JSON.stringify(form.config),
        }),
      })
      const newRule = await res.json()
      setEditingId(newRule.id)
      setMode("edit")
      fetchRules()
    } else if (mode === "edit" && editingId) {
      await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: form.name,
          description: form.description,
          prompt: form.prompt,
          config: JSON.stringify(form.config),
        }),
      })
      fetchRules()
    }
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("确定要删除这个润色规则吗？")) return
    await fetch(`/api/polish/rules?id=${ruleId}`, { method: "DELETE" })
    if (editingId === ruleId) {
      setMode(null)
      setEditingId(null)
    }
    fetchRules()
  }

  const panelOpen = mode !== null

  return (
    <div className="flex h-full">
      {/* 左侧：规则列表 */}
      <div className="flex-1 min-w-0 overflow-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">AI 润色</h1>
            <AddButton onClick={startCreate} />
          </div>
        </div>

        <div className="mb-8">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有润色规则，请先创建</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rules.map((rule) => {
                const cfg = parseConfig(rule.config, DEFAULT_POLISH_CONFIG)
                return (
                  <SimpleCard
                    key={rule.id}
                    title={rule.name}
                    description={rule.description}
                    selected={editingId === rule.id}
                    onClick={() => openForEdit(rule)}
                    onDelete={() => deleteRule(rule.id)}
                  >
                    <ConfigBadges {...cfg} />
                  </SimpleCard>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右侧：编辑面板（抽拉展开） */}
      <SlidingDrawer
        open={panelOpen}
        onClose={() => { setMode(null); setEditingId(null) }}
        title={
          <>
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">
              {mode === "create" ? "新建规则" : "编辑规则"}
            </h2>
          </>
        }
        onCreate={mode === "create" ? saveRule : undefined}
        onUpdate={mode === "edit" ? saveRule : undefined}
      >
        {/* 规则名称 + 规则描述 */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="规则名称"
            icon={PenTool}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="如：口语化→书面化"
          />
          <FormInput
            label="规则描述"
            icon={FileText}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="简单描述这个规则的作用"
          />
        </div>

        {/* 自定义补充说明 */}
        <div className="space-y-1.5">
          <Label>自定义补充说明</Label>
          <Textarea
            value={form.config.prompt || ""}
            onChange={(e) =>
              setForm({ ...form, config: { ...form.config, prompt: e.target.value } })
            }
            placeholder="可在此补充额外的润色要求..."
            rows={2}
          />
        </div>

        {/* 润色配置选项 */}
        <div className="border-t pt-4">
          <PolishRuleConfigEditor
            config={form.config}
            onChange={(cfg) => setForm({ ...form, config: { ...form.config, ...cfg } })}
          />
        </div>
      </SlidingDrawer>
    </div>
  )
}
