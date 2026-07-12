import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId, nextSortOrder } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  const foreshadowings = list('foreshadowing', novelId)
  return NextResponse.json(foreshadowings)
}

export async function POST(req: NextRequest) {
  const { novelId, name } = await req.json()
  if (!novelId || !name) return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
  const id = genId()
  const sortOrder = nextSortOrder('foreshadowing', novelId)
  put('foreshadowing', id, { novelId, name, sortOrder }, novelId)
  const foreshadowing = get('foreshadowing', id, novelId)
  return NextResponse.json(foreshadowing)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, name } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('foreshadowing', id, { name }, novelId)
  const foreshadowing = get('foreshadowing', id, novelId)
  return NextResponse.json(foreshadowing)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('foreshadowing', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
