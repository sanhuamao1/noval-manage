import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function parseGenres(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [raw]
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { chapters: true, characters: true },
        },
      },
    })
    return NextResponse.json(novel ? { ...novel, genre: parseGenres(novel.genre) } : novel)
  }

  const novels = await prisma.novel.findMany({
    include: {
      _count: {
        select: { chapters: true, characters: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(novels.map((n) => ({ ...n, genre: parseGenres(n.genre) })))
}

export async function POST(req: NextRequest) {
  const { title, description } = await req.json()
  const novel = await prisma.novel.create({
    data: { title, description },
  })
  return NextResponse.json({ ...novel, genre: parseGenres(novel.genre) })
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
