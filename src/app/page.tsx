"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Plus, BookOpen, Trash2 } from "lucide-react"

interface Novel {
  id: string
  title: string
  description: string | null
  createdAt: string
  _count: {
    chapters: number
    characters: number
  }
}

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchNovels()
  }, [])

  async function fetchNovels() {
    const res = await fetch("/api/novels")
    const data = await res.json()
    setNovels(data)
  }

  async function createNovel() {
    if (!title.trim()) return
    const res = await fetch("/api/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    if (res.ok) {
      setOpen(false)
      setTitle("")
      setDescription("")
      fetchNovels()
    }
  }

  async function deleteNovel(id: string) {
    if (!confirm("确定要删除这个作品吗？所有章节和人物数据将被永久删除。")) return
    await fetch(`/api/novels?id=${id}`, { method: "DELETE" })
    fetchNovels()
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">我的作品</h1>
            <p className="text-muted-foreground mt-1">管理你的小说创作项目</p>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" className="rounded-lg">
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="作品名称"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        createNovel()
                      }
                    }}
                  />
                </div>
                <Button onClick={createNovel} className="w-full">
                  创建
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {novels.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">还没有作品</h2>
            <p className="text-muted-foreground mb-6">点击上方按钮创建你的第一部小说</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="group relative border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/novel/${novel.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{novel.title}</h3>
                    {novel.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {novel.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNovel(novel.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>{novel._count.chapters} 章节</span>
                  <span>{novel._count.characters} 人物</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
