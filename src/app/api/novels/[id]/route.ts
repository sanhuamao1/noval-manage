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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.genre !== undefined) data.genre = JSON.stringify(body.genre)
  if (body.status !== undefined) data.status = body.status

  const novel = await prisma.novel.update({
    where: { id },
    data,
  })

  return NextResponse.json({ ...novel, genre: parseGenres(novel.genre) })
}
