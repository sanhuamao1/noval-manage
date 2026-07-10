"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { PolishRuleConfigEditor } from "@/components/polish/PolishRuleConfigEditor"
import { parsePolishConfig, DEFAULT_POLISH_CONFIG, type PolishRuleConfig } from "@/types/polish"

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  config: string | null
}

/** 将配置项渲染为摘要标签 */
function ConfigBadges(config: PolishRuleConfig) {
  const badges: string[] = []

  if (config.pace) badges.push(`节奏：${config.pace}`)
  if (config.mood.length > 0) badges.push(`氛围：${config.mood.join("/")}`)
  if (config.narrative) badges.push(`叙事：${config.narrative}`)
  if (config.senses.length > 0) badges.push(`五感：${config.senses.join("/")}`)
  if (config.character.length > 0) badges.push(`人物：${config.character.join("/")}`)
  if (config.environment.length > 0) badges.push(`环境：${config.environment.join("/")}`)
  if (config.rhetoric) badges.push(`修辞：${config.rhetoric}`)
  if (config.timeVariation) badges.push("节奏变奏")
  if (config.contrastInsertion) badges.push("反差插入")

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
  const params = useParams()
  const id = params.id as string
  const [rules, setRules] = useState<PolishRule[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PolishRule | null>(null)
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

  function openCreate() {
    setEditing(null)
    setForm({ name: "", description: "", prompt: "", config: { ...DEFAULT_POLISH_CONFIG } })
    setOpen(true)
  }

  function openEdit(rule: PolishRule) {
    setEditing(rule)
    setForm({
      name: rule.name,
      description: rule.description || "",
      prompt: rule.prompt,
      config: parsePolishConfig(rule.config),
    })
    setOpen(true)
  }

  async function saveRule() {
    if (!form.name.trim()) return

    const payload = {
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      description: form.description,
      prompt: form.prompt,
      config: JSON.stringify(form.config),
    }

    if (editing) {
      await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    setOpen(false)
    fetchRules()
  }

  async function deleteRule(ruleId: string) {
    if (!confirm("确定要删除这个润色规则吗？")) return
    await fetch(`/api/polish/rules?id=${ruleId}`, { method: "DELETE" })
    fetchRules()
  }

  return (
    <div className="p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI 润色</h1>
            <p className="text-sm text-muted-foreground mt-1">
              使用 AI 对文本进行润色优化
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新建规则
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="font-semibold mb-3">润色规则</h2>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有润色规则，请先创建</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rules.map((rule) => {
                const cfg = parsePolishConfig(rule.config)
                return (
                  <div key={rule.id} className="border rounded-lg p-4 group hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-sm">{rule.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => openEdit(rule)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    )}
                    <ConfigBadges {...cfg} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "编辑规则" : "新建规则"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>规则名称 *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="如：口语化→书面化"
                />
              </div>
              <div>
                <Label>规则描述</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="简单描述这个规则的作用"
                />
              </div>
              <div>
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

              <div className="border-t pt-4">
                <PolishRuleConfigEditor
                  config={form.config}
                  onChange={(cfg) => setForm({ ...form, config: { ...form.config, ...cfg } })}
                />
              </div>

              <Button onClick={saveRule} className="w-full">
                {editing ? "保存修改" : "创建"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
