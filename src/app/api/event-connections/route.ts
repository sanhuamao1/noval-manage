import { NextRequest, NextResponse } from "next/server"
import { createRoute } from "@/lib/api-routes"
import { list, get, put, remove, genId } from "@/lib/store"

async function customGet(req: NextRequest, _entity: string) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get("novelId")
  const eventId = searchParams.get("eventId")
  const id = searchParams.get("id")

  if (id) {
    const record = await get("event-connection", id, novelId ?? undefined)
    if (!record) return NextResponse.json({ error: "未找到" }, { status: 404 })
    return NextResponse.json(record)
  }

  // Get all connections, optionally filter by source or target event
  const allConnections = await list("event-connection", novelId ?? undefined)
  if (eventId) {
    const filtered = allConnections.filter(
      (c) => (c as Record<string, unknown>).sourceId === eventId || (c as Record<string, unknown>).targetId === eventId,
    )
    return NextResponse.json(filtered)
  }
  return NextResponse.json(allConnections)
}

async function customPost(req: NextRequest, _entity: string) {
  const body: Record<string, unknown> = await req.json()
  const { novelId, sourceId, targetId, type, strength } = body

  if (!sourceId || !targetId) {
    return NextResponse.json({ error: "缺少 sourceId 或 targetId" }, { status: 400 })
  }

  // Check for duplicate
  const allConnections = await list("event-connection", novelId as string ?? undefined)
  const duplicate = allConnections.find(
    (c) => (c as Record<string, unknown>).sourceId === sourceId && (c as Record<string, unknown>).targetId === targetId,
  )
  if (duplicate) {
    return NextResponse.json({ error: "连接已存在" }, { status: 409 })
  }

  const id = genId()
  await put("event-connection", id, {
    sourceId,
    targetId,
    type: type ?? "导致",
    strength: strength ?? 1,
  }, novelId as string | undefined)

  const record = await get("event-connection", id, novelId as string | undefined)
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

  await put("event-connection", id, data, novelId)
  const record = await get("event-connection", id, novelId)
  return NextResponse.json(record)
}

async function handleDelete(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 })

  await remove("event-connection", id)
  return NextResponse.json({ success: true })
}

export const GET = customGet
export const POST = customPost
export const PUT = customPut
export const DELETE = handleDelete
