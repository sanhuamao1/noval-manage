import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { list } from "@/lib/store"

/** character-emotions 的 GET 支持按 outlineId 过滤 */
async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const outlineId = searchParams.get("outlineId")

  if (!outlineId) return NextResponse.json({ error: "缺少 outlineId" }, { status: 400 })

  const emotions = list("character-emotion", novelId ?? undefined).filter(
    (ce) => (ce as Record<string, unknown>).outlineId === outlineId,
  )
  return NextResponse.json(emotions)
}

const { GET, POST, PUT, DELETE } = createRoute("character-emotion", {
  get: customGet,
})

export { GET, POST, PUT, DELETE }
