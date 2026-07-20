import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { list } from "@/lib/store"

/** key-events 的 GET 支持按 outlineId 过滤 */
async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const outlineId = searchParams.get("outlineId")

  if (outlineId) {
    const events = list("key-event", novelId ?? undefined).filter(
      (ke) => (ke as Record<string, unknown>).outlineId === outlineId,
    )
    return NextResponse.json(events)
  }

  if (novelId) return NextResponse.json(list("key-event", novelId))
  return NextResponse.json({ error: "缺少 novelId 或 outlineId" }, { status: 400 })
}

const { GET, POST, PUT, DELETE } = createRoute("key-event", {
  useSortOrder: true,
  get: customGet,
  postValidate: (body) => {
    if (!body.outlineId) return "缺少 outlineId"
    if (!body.title) return "缺少标题"
    return null
  },
})

export { GET, POST, PUT, DELETE }
