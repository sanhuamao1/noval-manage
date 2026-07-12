import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId, nextSortOrder } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  const locations = list('location', novelId)
  return NextResponse.json(locations)
}

export async function POST(req: NextRequest) {
  const { novelId, name } = await req.json()
  if (!novelId || !name) return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
  const id = genId()
  const sortOrder = nextSortOrder('location', novelId)
  put('location', id, { novelId, name, sortOrder }, novelId)
  const location = get('location', id, novelId)
  return NextResponse.json(location)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, name } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('location', id, { name }, novelId)
  const location = get('location', id, novelId)
  return NextResponse.json(location)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('location', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
