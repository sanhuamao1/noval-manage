import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId, nextSortOrder } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  const outlineId = searchParams.get('outlineId')

  if (outlineId) {
    const events = list('key-event', novelId ?? undefined).filter(
      (ke) => (ke as Record<string, unknown>).outlineId === outlineId
    )
    return NextResponse.json(events)
  }

  if (novelId) {
    const events = list('key-event', novelId)
    return NextResponse.json(events)
  }

  return NextResponse.json({ error: '缺少 novelId 或 outlineId' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { novelId, outlineId, title } = await req.json()
  if (!outlineId || !title) return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
  const id = genId()
  const sortOrder = nextSortOrder('key-event', novelId)
  put('key-event', id, { novelId, outlineId, title, sortOrder }, novelId)
  const event = get('key-event', id, novelId)
  return NextResponse.json(event)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, title } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('key-event', id, { title }, novelId)
  const event = get('key-event', id, novelId)
  return NextResponse.json(event)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('key-event', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
