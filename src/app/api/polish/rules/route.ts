import { NextRequest, NextResponse } from 'next/server'
import { list, get, put, remove, genId } from '@/lib/store'

export async function GET() {
  const rules = list('polish-rule')
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const { name, description, prompt, ...rest } = await req.json()
  const id = genId()
  put('polish-rule', id, {
    name,
    description: description ?? null,
    prompt: prompt ?? '',
    useCount: 0,
    ...rest,
  })
  const rule = get('polish-rule', id)
  return NextResponse.json(rule)
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  put('polish-rule', id, data)
  const rule = get('polish-rule', id)
  return NextResponse.json(rule)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  remove('polish-rule', id)
  return NextResponse.json({ success: true })
}
