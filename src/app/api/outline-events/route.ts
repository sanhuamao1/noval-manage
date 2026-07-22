import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { list, get, put, remove, genId, nextSortOrder } from "@/lib/store"

async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const outlineId = searchParams.get("outlineId")
  const id = searchParams.get("id")

  if (id) {
    const record = await get("outline-event", id, novelId ?? undefined)
    if (!record) return NextResponse.json({ error: "未找到" }, { status: 404 })
    return NextResponse.json(record)
  }

  const allLinks = await list("outline-event", novelId ?? undefined)

  if (outlineId) {
    const filtered = allLinks
      .filter((l) => (l as Record<string, unknown>).outlineId === outlineId)
      .sort((a, b) => ((a as Record<string, unknown>).sortOrder as number) - ((b as Record<string, unknown>).sortOrder as number))
    return NextResponse.json(filtered)
  }

  return NextResponse.json(allLinks)
}

async function customPost(req: NextRequest, _entity: string) {
  const body: Record<string, unknown> = await req.json()
  const { novelId, outlineId, eventId, sortOrder } = body

  if (!outlineId || !eventId) {
    return NextResponse.json({ error: "缺少 outlineId 或 eventId" }, { status: 400 })
  }

  // Check for duplicate
  const existing = await list("outline-event", novelId as string ?? undefined)
  const duplicate = existing.find(
    (l) => (l as Record<string, unknown>).outlineId === outlineId && (l as Record<string, unknown>).eventId === eventId,
  )
  if (duplicate) {
    return NextResponse.json({ error: "该事件已关联到此大纲" }, { status: 409 })
  }

  const id = genId()
  const order = sortOrder ?? await nextSortOrder("outline-event", novelId as string | undefined)

  await put("outline-event", id, {
    novelId,
    outlineId,
    eventId,
    sortOrder: order,
  }, novelId as string | undefined)

  const record = await get("outline-event", id, novelId as string | undefined)
  return NextResponse.json(record)
}

async function customPut(req: NextRequest, _entity: string) {
  const body: Record<string, unknown> = await req.json()
  const id = body.id as string | undefined
  const novelId = body.novelId as string | undefined

  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 })

  const data: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (key !== "id" && key !== "novelId") {
      data[key] = body[key]
    }
  }

  await put("outline-event", id, data, novelId)
  const record = await get("outline-event", id, novelId)
  return NextResponse.json(record)
}

async function handleDelete(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 })

  await remove("outline-event", id)
  return NextResponse.json({ success: true })
}

export const GET = customGet
export const POST = customPost
export const PUT = customPut
export const DELETE = handleDelete
