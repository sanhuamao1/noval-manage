"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CardList } from "@/components/ui/card-list";
import { SimpleCard } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";
import { Plus, BookOpen } from "lucide-react"
import { api } from "@/lib/api"

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
    const data = await api<Novel[]>({ url: "/api/novels" })
    setNovels(data)
  }

  async function createNovel() {
    if (!title.trim()) return
    await api({ url: "/api/novels", method: "POST", data: { title, description } })
    setOpen(false)
    setTitle("")
    setDescription("")
    fetchNovels()
  }

  async function deleteNovel(id: string) {
    if (!confirm("确定要删除这个作品吗？所有章节和人物数据将被永久删除。")) return
    await api({ url: `/api/novels?id=${id}`, method: "DELETE" })
    fetchNovels()
  }

  return (
    <PageLayout title="我的作品" description="管理你的小说创作项目" handler={
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
    }>
      <CardList emptyText="点击上方按钮创建你的第一部小说">
        {novels.map((novel) => (
          <SimpleCard
            key={novel.id}
            size="md"
            icon={BookOpen}
            title={novel.title}
            description={novel.description}
            onClick={() => router.push(`/novel/${novel.id}`)}
            onDelete={() => deleteNovel(novel.id)}
          >
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{novel._count.chapters} 章节</span>
              <span>{novel._count.characters} 人物</span>
            </div>
          </SimpleCard>
        ))}
      </CardList>
    </PageLayout>

  )
}
