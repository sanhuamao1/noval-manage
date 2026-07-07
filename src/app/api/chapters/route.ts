import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  if (!novelId) {
    return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  }
  const chapters = await prisma.chapter.findMany({
    where: { novelId },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(chapters)
}

export async function POST(req: NextRequest) {
  const { novelId, title, content } = await req.json()
  
  // 获取当前最大排序值
  const lastChapter = await prisma.chapter.findFirst({
    where: { novelId },
    orderBy: { sortOrder: 'desc' },
  })
  const sortOrder = (lastChapter?.sortOrder ?? -1) + 1

  const chapter = await prisma.chapter.create({
    data: { novelId, title, content, sortOrder },
  })
  return NextResponse.json(chapter)
}

export async function PUT(req: NextRequest) {
  const { id, title, content, status, relatedCharacters } = await req.json()
  const data: any = {}
  if (title !== undefined) data.title = title
  if (content !== undefined) data.content = content
  if (status !== undefined) data.status = status
  if (relatedCharacters !== undefined) data.relatedCharacters = relatedCharacters
  const chapter = await prisma.chapter.update({
    where: { id },
    data,
  })
  return NextResponse.json(chapter)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  }
  await prisma.chapter.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
