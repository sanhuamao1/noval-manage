import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  if (!novelId) return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  const items = list('character', novelId)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const { novelId, name, ...rest } = await req.json()
  if (!novelId || !name) return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
  const id = genId()
  put('character', id, { novelId, name, ...rest }, novelId)
  const character = get('character', id, novelId)
  return NextResponse.json(character)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('character', id, data, novelId)
  const character = get('character', id, novelId)
  return NextResponse.json(character)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('character', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
