"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Users, Sparkles } from "lucide-react"

interface NovelStats {
  id: string
  title: string
  description: string | null
  _count: {
    chapters: number
    characters: number
  }
}

export default function NovelOverview() {
  const params = useParams()
  const router = useRouter()
  const [stats, setStats] = useState<NovelStats | null>(null)
  const id = params.id as string

  useEffect(() => {
    fetch(`/api/novels?id=${id}`)
      .then(res => res.json())
      .then(data => setStats(data))
  }, [id])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{stats.title}</h1>
          {stats.description && (
            <p className="text-muted-foreground mt-2">{stats.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            className="border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push(`/novel/${id}/chapters`)}
          >
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">{stats._count.chapters}</h3>
            <p className="text-sm text-muted-foreground">章节</p>
          </div>
          <div
            className="border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push(`/novel/${id}/characters`)}
          >
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">{stats._count.characters}</h3>
            <p className="text-sm text-muted-foreground">人物</p>
          </div>
          <div
            className="border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push(`/novel/${id}/polish`)}
          >
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">AI 润色</h3>
            <p className="text-sm text-muted-foreground">润色规则管理</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.push(`/novel/${id}/chapters`)}>
            <FileText className="w-4 h-4 mr-2" />
            开始写作
          </Button>
          <Button variant="outline" onClick={() => router.push(`/novel/${id}/characters`)}>
            <Users className="w-4 h-4 mr-2" />
            管理人物
          </Button>
        </div>
      </div>
    </div>
  )
}
