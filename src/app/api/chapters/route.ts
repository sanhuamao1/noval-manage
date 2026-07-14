import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId, nextSortOrder } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  const id = searchParams.get('id')
  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })

  // 获取单个章节（含 content）
  if (id) {
    const chapter = get('chapter', id, novelId)
    if (!chapter) return NextResponse.json({ error: '章节不存在' }, { status: 404 })
    return NextResponse.json(chapter)
  }

  // 获取章节列表（不含 content）
  const chapters = list('chapter', novelId) as Record<string, unknown>[]
  const summaries = chapters.map(({ content, ...rest }) => rest)
  return NextResponse.json(summaries)
}

export async function POST(req: NextRequest) {
  const { novelId, title, content } = await req.json()
  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  const id = genId()
  const sortOrder = nextSortOrder('chapter', novelId)
  put('chapter', id, { novelId, title: title ?? '', content: content ?? '', status: 'draft', sortOrder, relatedCharacters: null }, novelId)
  const chapter = get('chapter', id, novelId)
  return NextResponse.json(chapter)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('chapter', id, data, novelId)
  const chapter = get('chapter', id, novelId)
  return NextResponse.json(chapter)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('chapter', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
