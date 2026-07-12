import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId } from '@/lib/store'

export async function GET() {
  const samples = list('polish-sample')
  return NextResponse.json(samples)
}

export async function POST(req: NextRequest) {
  const { name, prompt, ...rest } = await req.json()
  const id = genId()
  put('polish-sample', id, {
    name,
    prompt: prompt ?? '',
    useCount: 0,
    ...rest,
  })
  const sample = get('polish-sample', id)
  return NextResponse.json(sample)
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('polish-sample', id, data)
  const sample = get('polish-sample', id)
  return NextResponse.json(sample)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('polish-sample', id)
  return NextResponse.json({ success: true })
}
