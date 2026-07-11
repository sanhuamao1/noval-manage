"use client"

import { useState, useEffect, useRef } from "react"
import { AddButton } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { SlidingDrawer } from "@/components/ui/drawer"
import { PageLayout } from "@/components/PageLayout"
import { PolishRuleEditor, type PolishRuleEditorHandle } from "@/components/polish/PolishRuleEditor"
import { SimpleCard } from "@/components/ui/card"
import { CardList } from "@/components/CardList"
import { DEFAULT_POLISH_CONFIG } from "@/lib/configs/polish-defs"
import { parseConfig } from "@/lib/configs/config-utils"
import { ConfigBadges, buildConfigTags } from "@/lib/configs/render-utils"
import { Stepper } from "@/components/ui/stepper"

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
  config: string | null
}

export default function PolishPage() {
  const [rules, setRules] = useState<PolishRule[]>([])
  const [mode, setMode] = useState<"create" | "edit" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editorRef = useRef<PolishRuleEditorHandle>(null)

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
  }

  /** 直接打开编辑区（create 模式） */
  function startCreate() {
    setMode("create")
    setEditingId(null)
  }

  async function saveRule() {
    if (!editorRef.current) return
    const { name, description, prompt, config } = editorRef.current.getData()
    if (!name.trim()) return

    if (mode === "create") {
      const res = await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, prompt, config: JSON.stringify(config) }),
      })
      if (!res.ok) return
      fetchRules()
    } else if (mode === "edit" && editingId) {
      const res = await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, description, prompt, config: JSON.stringify(config) }),
      })
      if (!res.ok) return
      fetchRules()
    }
    setMode(null)
    setEditingId(null)
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

  const editingRule = editingId ? rules.find((r) => r.id === editingId) ?? null : null

  return (
    <PageLayout
      title="AI 润色"
      handler={<AddButton onClick={startCreate} />}
      drawer={
        <SlidingDrawer
          open={mode !== null}
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
          <PolishRuleEditor
            key={editingId ?? "create"}
            ref={editorRef}
            initialName={editingRule?.name ?? ""}
            initialDescription={editingRule?.description ?? ""}
            initialPrompt={editingRule?.prompt ?? ""}
            initialConfig={editingRule ? parseConfig(editingRule.config, DEFAULT_POLISH_CONFIG) : DEFAULT_POLISH_CONFIG}
          />
        </SlidingDrawer>
      }
    >
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
              selected={editingId === rule.id}
              onClick={() => openForEdit(rule)}
              onDelete={() => deleteRule(rule.id)}
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
            </SimpleCard>
          )
        })}
      </CardList>
    </PageLayout>
)
}
