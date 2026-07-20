import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { get, list } from "@/lib/store"

/**
 * chapters 的 GET 支持 id 区分：
 * - 列表：`list()` 只读 .yml 元数据，天然不含 content
 * - 单条：`get()` 自动从 .content 文件合并正文
 */
async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const id = searchParams.get("id")

  if (!novelId) return NextResponse.json({ error: "缺少 novelId" }, { status: 400 })

  // 单条（含 content）
  if (id) {
    const chapter = get("chapter", id, novelId)
    if (!chapter) return NextResponse.json({ error: "章节不存在" }, { status: 404 })
    return NextResponse.json(chapter)
  }

  // 列表（不含 content）
  const chapters = list("chapter", novelId)
  return NextResponse.json(chapters)
}

const { GET, POST, PUT, DELETE } = createRoute("chapter", {
  useSortOrder: true,
  get: customGet,
  postDefaults: { title: "", content: "", status: "draft", relatedCharacters: null },
})

export { GET, POST, PUT, DELETE }
