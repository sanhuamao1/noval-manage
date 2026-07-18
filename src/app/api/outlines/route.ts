import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId, nextSortOrder } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  const id = searchParams.get('id')

  if (id) {
    const outline = get('outline', id, novelId ?? undefined)
    if (!outline) return NextResponse.json({ error: '未找到' }, { status: 404 })
    // 附带关联数据
    const chapter = null // 章节关联暂不处理
    const keyEvents = list('key-event', novelId ?? undefined).filter(
      (ke) => (ke as Record<string, unknown>).outlineId === id
    )
    return NextResponse.json({ ...outline, chapter, keyEvents })
  }

  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  const outlines = list('outline', novelId)
  return NextResponse.json(outlines)
}

export async function POST(req: NextRequest) {
  const { novelId, name } = await req.json()
  if (!novelId || !name) return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
  const id = genId()
  const sortOrder = nextSortOrder('outline', novelId)
  put('outline', id, { novelId, name, sortOrder, status: 'planned' }, novelId)
  const outline = get('outline', id, novelId)
  return NextResponse.json(outline)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('outline', id, data, novelId)
  const outline = get('outline', id, novelId)
  return NextResponse.json(outline)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('outline', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
