import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { callAI, buildPolishPrompt } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { ruleId, text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: '请提供要润色的文本' }, { status: 400 })
    }

    // 获取润色规则
    const rule = await prisma.polishRule.findUnique({
      where: { id: ruleId },
    })

    if (!rule) {
      return NextResponse.json({ error: '未找到润色规则' }, { status: 400 })
    }

    // 调用 AI
    const prompt = buildPolishPrompt(rule, text)
    const polishedText = await callAI(prompt)

    return NextResponse.json({ originalText: text, polishedText })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
