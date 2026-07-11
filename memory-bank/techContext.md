# 技术上下文

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js ^14.2.0 | App Router，@/* 别名 |
| 样式 | Tailwind CSS ^3.4.0 | 琥珀色彩系统 |
| UI | shadcn/ui (Radix) + 自定义 | Dialog/Popover/Tag/RadioGroup/Drawer/Tabs |
| 编辑器 | 原生 Textarea | Tab 缩进，居中 800px |
| 数据库 | Prisma ^5.14.0 + SQLite | 文件数据库 |
| AI | DeepSeek（兼容 OpenAI） | 自定义 endpoint |
| 图标 | lucide-react ^1.23.0 | |

## 环境

Node.js v22.12.0 / Windows 11

## 数据库模型

| 模型 | 关键字段 | 关联 |
|------|---------|------|
| Novel | title/description/genre(JSON)/status | → Chapter/Character/Outline/Brainstorm |
| Chapter | title/content/status/relatedCharacters(JSON)/sortOrder | → CharacterEmotion |
| Character | name/gender/age/identity/traits(JSON) | → CharacterEmotion |
| PolishRule | name/description/prompt/config(JSON)/type(base\|sample)/useCount | — |
| Outline (计划) | parentId?/title/content/type/sortOrder | 关联章节 |
| CharacterEmotion (计划) | emotion/intensity(1-10) | 关联人物+章节 |
| Brainstorm (计划) | title/content/tags(JSON)/type | — |

## 环境变量

```
AI_API_KEY=xxx
AI_BASE_URL=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
```

## 脚本

`npm run dev` / `build` / `start` / `lint` / `db:push` / `db:reset`

## 已知问题

- 无 Markdown 预览（react-markdown 已安装未使用）
- 无分页、无导出
- AI Key 需手动配置 .env.local
- 仅暗色模式
