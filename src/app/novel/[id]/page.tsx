"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/form-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioOption } from "@/components/radio-group"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tag } from "@/components/ui/tag"
import {
  Info, Sparkles, Edit3, Save, X,
  BookMarked, Rocket, Building2, Heart, Book, Search,
  Wand2, Sword, Shield, Gamepad2, Globe, Clock
} from "lucide-react"
import React from "react"

// 题材选项
const genreOptions: RadioOption[] = [
  { value: "玄幻", icon: Sparkles },
  { value: "仙侠", icon: BookMarked },
  { value: "科幻", icon: Rocket },
  { value: "都市", icon: Building2 },
  { value: "言情", icon: Heart },
  { value: "历史", icon: Book },
  { value: "悬疑", icon: Search },
  { value: "奇幻", icon: Wand2 },
  { value: "武侠", icon: Sword },
  { value: "军事", icon: Shield },
  { value: "游戏", icon: Gamepad2 },
  { value: "现实", icon: Globe },
]

// 状态选项
const statusOptions: RadioOption[] = [
  { value: "连载中", icon: Sparkles },
  { value: "已完结", icon: BookMarked },
  { value: "暂停", icon: Clock },
]

interface NovelData {
  id: string
  title: string
  description: string | null
  genre: string[]
  status: string
}

export default function NovelOverview() {
  const params = useParams()
  const router = useRouter()
  const [novel, setNovel] = useState<NovelData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const id = params.id as string

  // 编辑状态
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editGenres, setEditGenres] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState("")

  const statusColorMap: Record<string, "primary" | "success" | "warn"> = {
    "连载中": "primary",
    "已完结": "success",
    "暂停": "warn",
  }

  const fetchNovel = useCallback(async () => {
    const res = await fetch(`/api/novels?id=${id}`)
    const data = await res.json()
    setNovel(data)
  }, [id])

  useEffect(() => {
    fetchNovel()
  }, [fetchNovel])

  function startEditing() {
    if (!novel) return
    setEditTitle(novel.title)
    setEditDescription(novel.description || "")
    setEditGenres(novel.genre)
    setEditStatus(novel.status)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
  }

  function toggleGenre(value: string) {
    setEditGenres((prev) =>
      prev.includes(value)
        ? prev.filter((g) => g !== value)
        : [...prev, value]
    )
  }

  async function saveChanges() {
    if (!novel || !editTitle.trim()) return
    setSaving(true)
    const res = await fetch(`/api/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        genre: editGenres.length > 0 ? editGenres : ["玄幻"],
        status: editStatus,
      }),
    })
    if (res.ok) {
      setSaving(false)
      setEditing(false)
      fetchNovel()
    } else {
      setSaving(false)
    }
  }

  if (!novel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* ── 编辑模式 ── */}
        {editing ? (
          <div className="mb-8 space-y-6">
            <Card>
              <CardHeader icon={Info} title="基本信息" rightHandler={
                <>
                  <Button variant="link" onClick={cancelEditing}>
                    <X className="w-4 h-4 mr-1.5" />
                    取消
                  </Button>
                  <Button onClick={saveChanges} disabled={saving || !editTitle.trim()}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </>
              } />
              <CardContent>
                {/* 作品名称 + 状态 一行两列 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="作品名称" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="作品名称" />
                  <div className="space-y-2">
                    <Label>状态</Label>
                    <div className="flex gap-2">
                      {statusOptions.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = editStatus === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditStatus(opt.value)}
                            className={`flex items-center justify-center gap-1 flex-1 h-7 rounded-md text-xs transition-all ${isSelected
                                ? "bg-bg-600 border border-amber-500 text-amber-400"
                                : "bg-bg-900 border border-transparent text-fg-tertiary hover:text-fg-secondary"
                              }`}
                          >
                            {Icon && <Icon className="w-3 h-3" />}
                            <span>{opt.value}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 简介 */}
                <div className="space-y-1.5">
                  <Label>简介 / 梗概</Label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="用一段话描述你的作品..."
                    rows={4}
                    className="bg-bg-850 border-border-subtle"
                  />
                </div>

                {/* 题材（多选） */}
                <div className="space-y-1.5">
                  <Label>题材（可多选）</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {genreOptions.map((opt) => {
                      const Icon = opt.icon
                      const isSelected = editGenres.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleGenre(opt.value)}
                          className={`flex items-center justify-center gap-1 h-7 rounded-md text-xs transition-all ${isSelected
                              ? "bg-bg-600 border border-amber-500 text-amber-400"
                              : "bg-bg-900 border border-transparent text-fg-tertiary hover:text-fg-secondary"
                            }`}
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          <span>{opt.value}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* ── 预览模式 ── */
          <>
            <Card>
              <CardHeader icon={Info} title="基本信息" rightHandler={
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  编辑
                </Button>
              } />
              <CardContent>
                {/* 标题 + 状态 + 题材 一行展示 */}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <h1 className="text-2xl font-bold">{novel.title}</h1>
                  <Tag color={statusColorMap[novel.status]}>{novel.status}</Tag>
                  {novel.genre.length > 0 && (
                    <>
                      <span className="text-muted-foreground/40">/</span>
                      {novel.genre.map((g) => {
                        const opt = genreOptions.find((o) => o.value === g)
                        return <Tag key={g} icon={opt?.icon}>{g}</Tag>
                      })}
                    </>
                  )}
                </div>

                {/* 简介 */}
                <div className="space-y-1.5">
                  <Label>简介 / 梗概</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {novel.description || <span className="italic">暂无简介</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
