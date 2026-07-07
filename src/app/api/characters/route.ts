import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const novelId = searchParams.get('novelId')
  if (!novelId) {
    return NextResponse.json({ error: '缺少 novelId' }, { status: 400 })
  }
  const characters = await prisma.character.findMany({
    where: { novelId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(characters)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const character = await prisma.character.create({ data })
  return NextResponse.json(character)
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json()
  const character = await prisma.character.update({
    where: { id },
    data,
  })
  return NextResponse.json(character)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
  }
  await prisma.character.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
