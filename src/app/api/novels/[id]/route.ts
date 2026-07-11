import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.config !== undefined) data.config = typeof body.config === 'string' ? body.config : JSON.stringify(body.config)

  const novel = await prisma.novel.update({
    where: { id },
    data,
  })

  return NextResponse.json(novel)
}