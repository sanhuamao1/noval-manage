"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, FileText, CheckCircle2, Circle } from "lucide-react"
import { wordCount } from "@/lib/utils"

interface Chapter {
  id: string
  title: string
  content: string
  status: string
  relatedCharacters: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

type FilterTab = "all" | "published" | "draft"

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "published", label: "定稿" },
  { key: "draft", label: "草稿" },
]

export default function ChaptersPage() {
  const params = useParams()
  const id = params.id as string
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")

  useEffect(() => {
    fetchChapters()
  }, [id])

  async function fetchChapters() {
    const res = await fetch(`/api/chapters?novelId=${id}`)
    const data = await res.json()
    setChapters(data)
  }

  async function createChapter() {
    if (!newTitle.trim()) return
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelId: id, title: newTitle, content: "" }),
    })
    if (res.ok) {
      setOpen(false)
      setNewTitle("")
      fetchChapters()
    }
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm("确定要删除这个章节吗？")) return
    await fetch(`/api/chapters?id=${chapterId}`, { method: "DELETE" })
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(null)
    }
    fetchChapters()
  }

  async function toggleStatus(chapter: Chapter) {
    const newStatus = chapter.status === "published" ? "draft" : "published"
    await fetch("/api/chapters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: chapter.id, status: newStatus }),
    })
    if (selectedChapter?.id === chapter.id) {
      setSelectedChapter({ ...selectedChapter, status: newStatus })
    }
    fetchChapters()
  }

  const saveChapter = useCallback(async () => {
    if (!selectedChapter) return
    setSaving(true)
    await fetch("/api/chapters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedChapter.id,
        title: editTitle,
        content: editContent,
      }),
    })
    setSaving(false)
    fetchChapters()
  }, [selectedChapter, editTitle, editContent])

  // 自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedChapter && (editTitle !== selectedChapter.title || editContent !== selectedChapter.content)) {
        saveChapter()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [editTitle, editContent, saveChapter, selectedChapter])

  function selectChapter(chapter: Chapter) {
    setSelectedChapter(chapter)
    setEditTitle(chapter.title)
    setEditContent(chapter.content)
  }

  const filteredChapters = chapters.filter((ch) => {
    if (filter === "all") return true
    return ch.status === filter
  })

  return (
    <div className="flex h-full">
      {/* 章节列表 */}
      <div className="w-72 border-r p-4 overflow-auto flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">章节列表</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                新建
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建章节</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>章节标题</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="输入章节标题"
                  />
                </div>
                <Button onClick={createChapter} className="w-full">
                  创建
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 过滤 Tab */}
        <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                filter === tab.key
                  ? "bg-background text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1">
                  ({chapters.filter((ch) => ch.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filteredChapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                selectedChapter?.id === chapter.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent"
              }`}
              onClick={() => selectChapter(chapter)}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  chapter.status === "published" ? "bg-green-500" : "bg-amber-500"
                }`}
              />
              <span className="flex-1 truncate">
                {chapter.title || `未命名章节 ${index + 1}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteChapter(chapter.id)
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
          {filteredChapters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {filter === "all" ? "还没有章节，点击上方按钮创建" : "没有符合条件的章节"}
            </p>
          )}
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 flex flex-col">
        {selectedChapter ? (
          <>
            <div className="border-b p-4">
              <div className="flex items-center gap-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                  placeholder="章节标题"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(selectedChapter)}
                    className={selectedChapter.status === "published" ? "text-green-500" : "text-amber-500"}
                  >
                    {selectedChapter.status === "published" ? (
                      <><CheckCircle2 className="w-4 h-4 mr-1" />已定稿</>
                    ) : (
                      <><Circle className="w-4 h-4 mr-1" />草稿</>
                    )}
                  </Button>
                  <span>{wordCount(editContent)} 字</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveChapter}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault()
                    const textarea = e.currentTarget
                    const start = textarea.selectionStart
                    const end = textarea.selectionEnd
                    const newValue = editContent.substring(0, start) + "    " + editContent.substring(end)
                    setEditContent(newValue)
                    requestAnimationFrame(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + 4
                    })
                  }
                }}
                className="min-h-full border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                placeholder="开始写作..."
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                选择一个章节开始编辑
              </h3>
              <p className="text-sm text-muted-foreground">
                从左侧列表中选择一个章节，或创建新章节
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
