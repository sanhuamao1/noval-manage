"use client"

import { useEffect } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, FileText, Sparkles, ScrollText, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/stores/useAppStore"

const navItems = [
  { href: "", label: "概览", icon: BookOpen },
  { href: "/chapters", label: "章节", icon: FileText },
  { href: "/outlines", label: "大纲", icon: ScrollText },
  { href: "/characters", label: "人物", icon: Users },
  { href: "/polish", label: "润色", icon: Sparkles },
]

export default function NovelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const id = params.id as string
  const novel = useAppStore((s) => s.novel)
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    if (novel?.id === id) return;
    init(id);
  }, [id, novel?.id, init])

  const currentPath = pathname.replace(`/novel/${id}`, "") || ""

  return (
    <>
      {/* 侧边栏 */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h2 className="font-semibold text-lg truncate">
            {novel?.title || "加载中..."}
          </h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.href}
                href={`/novel/${id}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/chapters" && (
                  <span className="text-xs text-muted-foreground/60">{novel?._count?.chapters ?? 0}</span>
                )}
                {item.href === "/characters" && (
                  <span className="text-xs text-muted-foreground/60">{novel?._count?.characters ?? 0}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </>
  )
}
