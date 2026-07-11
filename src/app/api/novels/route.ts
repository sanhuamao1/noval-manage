import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** 计算章节内容字数 */
function calculateWordCount(chapters: { content: string }[]): number {
  return chapters.reduce((count, chapter) => {
    return count + chapter.content.length
  }, 0)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        chapters: {
          select: { content: true },
        },
        _count: {
          select: { chapters: true, characters: true },
        },
      },
    })
    if (novel) {
      // 添加 wordCount 字段
      const novelWithWordCount = {
        ...novel,
        wordCount: calculateWordCount(novel.chapters),
        chapters: undefined, // 移除原始 chapters 数据
      }
      return NextResponse.json(novelWithWordCount)
    }
    return NextResponse.json(novel, { status: 404 })
  }

  const novels = await prisma.novel.findMany({
    include: {
      chapters: {
        select: { content: true },
      },
      _count: {
        select: { chapters: true, characters: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  // 为每个作品添加 wordCount
  const novelsWithWordCount = novels.map(({ chapters, ...novel }) => ({
    ...novel,
    wordCount: calculateWordCount(chapters),
  }))
  return NextResponse.json(novelsWithWordCount)
}

export async function POST(req: NextRequest) {
  const { title, description } = await req.json()
  const novel = await prisma.novel.create({
    data: { title, description },
  })
  return NextResponse.json(novel)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  }
  await prisma.novel.delete({ where: { id } })
  return NextResponse.json({ success: true })
}