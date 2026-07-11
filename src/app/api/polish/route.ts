import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { callAI, buildPolishPrompt, buildStylePrompt } from '@/lib/ai'
import { parseConfig } from '@/lib/configs/config-utils'
import { DEFAULT_SAMPLE_CONFIG } from '@/lib/configs/polish-defs'

export async function POST(req: NextRequest) {
  try {
    const { type, ruleId, sampleIds, text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: '请提供要润色的文本' }, { status: 400 })
    }

    // 规则模式 —— 直接按 ruleId 查询并执行
    if (type === 'rule') {
      const rule = await prisma.polishRule.findUnique({
        where: { id: ruleId },
      })
      if (!rule) {
        return NextResponse.json({ error: '未找到润色规则' }, { status: 400 })
      }

      const prompt = buildPolishPrompt(rule, text)
      const polishedText = await callAI(prompt)

      await prisma.polishRule.update({
        where: { id: ruleId },
        data: { useCount: { increment: 1 } },
      })

      return NextResponse.json({ originalText: text, polishedText })
    }

    // 样本模式 —— 按 sampleIds 批量查询并执行
    if (type === 'sample') {
      const samples = sampleIds?.length
        ? await prisma.polishRule.findMany({
            where: { id: { in: sampleIds }, type: 'sample' },
          })
        : []

      const styleSamples = samples.map((s) => {
        const cfg = parseConfig(s.config, DEFAULT_SAMPLE_CONFIG as any) as any
        return {
          title: s.name,
          annotation: s.prompt || null,
          text: cfg.text || '',
          is_negative: !!cfg.is_negative,
        }
      })

      const prompt =
        buildStylePrompt(styleSamples) +
        `\n请参考以上风格对以下文本进行润色（结果需要缩进，每段不需要换行）：\n原文：\n${text}\n\n请直接返回润色后的结果，不要添加任何解释。`

      const polishedText = await callAI(prompt)

      if (sampleIds?.length > 0) {
        await prisma.polishRule.updateMany({
          where: { id: { in: sampleIds } },
          data: { useCount: { increment: 1 } },
        })
      }

      return NextResponse.json({ originalText: text, polishedText })
    }

    return NextResponse.json({ error: '请指定润色规则或风格样本' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
