import { NextRequest, NextResponse } from 'next/server'
import { updateNovel } from '@/lib/store'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  // 所有字段都是顶层字段，直接更新
  const data: Record<string, unknown> = {}
  const allowed = [
    'title', 'description', 'status', 'genre', 'enablePreset', 'presetStyle',
    'primaryTone', 'secondaryTones', 'worldType', 'worldShape',
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const novel = updateNovel(id, data)
  if (!novel) return NextResponse.json({ error: '未找到' }, { status: 404 })
  return NextResponse.json(novel)
}
