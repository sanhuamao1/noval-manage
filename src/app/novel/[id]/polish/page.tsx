"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit2, Sparkles, Wand2 } from "lucide-react"

interface PolishRule {
  id: string
  name: string
  description: string | null
  prompt: string
}

export default function PolishPage() {
  const params = useParams()
  const id = params.id as string
  const [rules, setRules] = useState<PolishRule[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PolishRule | null>(null)
  const [form, setForm] = useState({ name: "", description: "", prompt: "" })
  const [inputText, setInputText] = useState("")
  const [selectedRule, setSelectedRule] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    setForm({ name: "", description: "", prompt: "" })
    setOpen(true)
  }

  function openEdit(rule: PolishRule) {
    setEditing(rule)
    setForm({ name: rule.name, description: rule.description || "", prompt: rule.prompt })
    setOpen(true)
  }

  async function saveRule() {
    if (!form.name.trim() || !form.prompt.trim()) return

    if (editing) {
      await fetch("/api/polish/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch("/api/polish/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  async function polish() {
    if (!inputText.trim() || !selectedRule) return
    setLoading(true)
    setError("")
    setResult("")

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: id,
          ruleId: selectedRule,
          text: inputText,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.polishedText)
      }
    } catch (err: any) {
      setError(err.message || "润色失败")
    } finally {
      setLoading(false)
    }
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

        {/* 润色规则列表 */}
        <div className="mb-8">
          <h2 className="font-semibold mb-3">润色规则</h2>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有润色规则，请先创建</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rules.map((rule) => (
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 润色工具 */}
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            润色工具
          </h2>

          <div className="space-y-4">
            <div>
              <Label>选择润色规则</Label>
              <Select value={selectedRule} onValueChange={setSelectedRule}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择润色规则" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>输入要润色的文本</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="粘贴或输入需要润色的文本..."
                rows={6}
              />
            </div>

            <Button
              onClick={polish}
              disabled={loading || !inputText.trim() || !selectedRule}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "润色中..." : "开始润色"}
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {result && (
              <div>
                <Label>润色结果</Label>
                <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                  {result}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(result)
                  }}
                >
                  复制结果
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 编辑规则对话框 */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
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
                <Label>AI 提示词 *</Label>
                <Textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="描述 AI 应该如何润色文本..."
                  rows={4}
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
