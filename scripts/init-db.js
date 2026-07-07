const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 创建一些默认的润色规则
  const rules = [
    {
      name: '口语→书面',
      description: '将口语化表达转换为书面语',
      prompt: '请将以下文本从口语化风格转换为正式的书面语风格，保持原意不变，优化用词和句式。',
    },
    {
      name: '精简凝练',
      description: '删除冗余表达，使文本更简洁',
      prompt: '请精简以下文本，删除冗余和重复的表达，使语言更加简洁有力，保留核心信息。',
    },
    {
      name: '文学润色',
      description: '增强文学性和表现力',
      prompt: '请对以下文本进行文学性润色，增强画面感和表现力，使用更丰富的修辞手法，但不要改变原意。',
    },
    {
      name: '对话优化',
      description: '优化人物对话，使其更自然',
      prompt: '请优化以下对话文本，使其更符合人物性格和场景氛围，让对话更加自然流畅。',
    },
  ]

  for (const rule of rules) {
    await prisma.polishRule.create({ data: rule })
  }

  console.log('✅ 数据库初始化完成！已创建默认润色规则。')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
