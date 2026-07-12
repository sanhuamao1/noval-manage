import { NextRequest, NextResponse } from 'next/server'
import { listNovels, getNovel, createNovel, removeNovel, getNovelWordCount, count } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const novel = getNovel(id)
    if (!novel) return NextResponse.json(null, { status: 404 })
    return NextResponse.json({
      ...novel,
      wordCount: getNovelWordCount(id),
      _count: { chapters: count('chapter', id), characters: count('character', id) },
    })
  }

  const novels = listNovels()
  const result = novels.map(n => ({
    ...n,
    wordCount: getNovelWordCount((n as Record<string, string>).id),
    _count: {
      chapters: count('chapter', (n as Record<string, string>).id),
      characters: count('character', (n as Record<string, string>).id),
    },
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { title, description } = await req.json()
  if (!title) return NextResponse.json({ error: '缺少 title' }, { status: 400 })
  const novel = createNovel(title, description)
  return NextResponse.json(novel)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  removeNovel(id)
  return NextResponse.json({ success: true })
}
