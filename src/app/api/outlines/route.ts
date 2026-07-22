import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { get, list } from "@/lib/store"

async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const id = searchParams.get("id")

  if (id) {
    const outline = await get("outline", id, novelId ?? undefined)
    if (!outline) return NextResponse.json({ error: "未找到" }, { status: 404 })
    return NextResponse.json({ ...outline, chapter: null })
  }

  if (!novelId) return NextResponse.json({ error: "缺少 novelId" }, { status: 400 })
  return NextResponse.json(await list("outline", novelId))
}

const { GET, POST, PUT, DELETE } = createRoute("outline", {
  useSortOrder: true,
  get: customGet,
  postDefaults: { status: "planned" },
  postValidate: (body) => (!body.name ? "名称不能为空" : null),
})

export { GET, POST, PUT, DELETE }
