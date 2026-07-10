import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const rules = await prisma.polishRule.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const { name, description, prompt, config } = await req.json()
  const rule = await prisma.polishRule.create({
    data: {
      name,
      description,
      prompt: prompt || '',
      config: config || '{}',
    },
  })
  return NextResponse.json(rule)
}

export async function PUT(req: NextRequest) {
  const { id, name, description, prompt, config } = await req.json()
  const rule = await prisma.polishRule.update({
    where: { id },
    data: {
      name,
      description,
      prompt: prompt || '',
      ...(config !== undefined ? { config } : {}),
    },
  })
  return NextResponse.json(rule)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  }
  await prisma.polishRule.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
