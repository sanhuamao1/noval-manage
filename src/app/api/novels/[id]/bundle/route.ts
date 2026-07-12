import { NextRequest, NextResponse } from 'next/server'
import { list, getNovel, getNovelWordCount, count } from '@/lib/store'

// GET /api/novels/[id]/bundle — 一次性获取小说+所有子资源
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const novel = getNovel(id)
  if (!novel) return NextResponse.json({ error: '作品不存在' }, { status: 404 })

  const [characters, locations, foreshadowings, outlines, keyEvents] = [
    list('character', id),
    list('location', id),
    list('foreshadowing', id),
    list('outline', id),
    list('key-event', id),
  ]

  return NextResponse.json({
    novel: {
      ...novel,
      wordCount: getNovelWordCount(id),
      _count: { chapters: count('chapter', id), characters: count('character', id) },
    },
    characters,
    locations,
    foreshadowings,
    outlines,
    keyEvents,
  })
}
