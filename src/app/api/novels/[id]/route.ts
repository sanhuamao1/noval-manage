import { NextRequest, NextResponse } from 'next/server'
import { updateNovel } from '@/lib/store'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const novel = updateNovel(id, body)
  if (!novel) return NextResponse.json({ error: '未找到' }, { status: 404 })
  return NextResponse.json(novel)
}
