import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const outlineId = searchParams.get('outlineId')
  const novelId = searchParams.get('novelId')
  if (!outlineId) return NextResponse.json({ error: '缺少 outlineId' }, { status: 400 })
  const emotions = list('character-emotion', novelId ?? undefined).filter(
    (ce) => (ce as Record<string, unknown>).outlineId === outlineId
  )
  return NextResponse.json(emotions)
}

export async function POST(req: NextRequest) {
  const { novelId, ...data } = await req.json()
  const id = genId()
  put('character-emotion', id, data, novelId)
  const emotion = get('character-emotion', id, novelId)
  return NextResponse.json(emotion)
}

export async function PUT(req: NextRequest) {
  const { id, novelId, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('character-emotion', id, data, novelId)
  const emotion = get('character-emotion', id, novelId)
  return NextResponse.json(emotion)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const novelId = searchParams.get('novelId')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('character-emotion', id, novelId ?? undefined)
  return NextResponse.json({ success: true })
}
