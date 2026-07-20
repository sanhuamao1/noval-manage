import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { get, list } from "@/lib/store"

/** outlines 的 GET 支持单条附带 keyEvents 关联数据 */
async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const id = searchParams.get("id")

  // 单条 → 附带关联 keyEvents
  if (id) {
    const outline = get("outline", id, novelId ?? undefined)
    if (!outline) return NextResponse.json({ error: "未找到" }, { status: 404 })
    const keyEvents = list("key-event", novelId ?? undefined).filter(
      (ke) => (ke as Record<string, unknown>).outlineId === id,
    )
    return NextResponse.json({ ...outline, chapter: null, keyEvents })
  }

  // 列表
  if (!novelId) return NextResponse.json({ error: "缺少 novelId" }, { status: 400 })
  return NextResponse.json(list("outline", novelId))
}

const { GET, POST, PUT, DELETE } = createRoute("outline", {
  useSortOrder: true,
  get: customGet,
  postDefaults: { status: "planned" },
  postValidate: (body) => (!body.name ? "名称不能为空" : null),
})

export { GET, POST, PUT, DELETE }
