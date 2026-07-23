"use client"

import { useParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Sparkles, ScrollText, ChevronLeft, Package, Wand2 } from "lucide-react"
import Link from "next/link"
import { useEntitySWR } from "@/hooks/useEntitySWR";
import type { NovelData } from "@/types/data";

const navItems = [
  { href: "", label: "概览", icon: BookOpen },
  { href: "/chapters", label: "章节", icon: FileText },
  { href: "/outline-events", label: "大纲事件", icon: ScrollText },
  { href: "/resources", label: "资源库", icon: Package },
  { href: "/polish", label: "润色", icon: Sparkles },
  { href: "/factory", label: "梦工厂", icon: Wand2 },
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
  const { data: novel } = useEntitySWR<NovelData>("novel", id)

  const currentPath = pathname.replace(`/novel/${id}`, "") || ""

  return (
    <>
      {/* 侧边栏 */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="w-4 h-4" />
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
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex">
        {children}
      </main>
    </>
  )
}
