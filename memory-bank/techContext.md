# 技术上下文

## 技术栈

| 层级     | 技术                    | 说明                                                            |
| -------- | ----------------------- | --------------------------------------------------------------- |
| 前端框架 | Next.js ^14.2.0         | App Router，路径别名 @/\*                                       |
| 样式     | Tailwind CSS ^3.4.0     | 琥珀色彩系统（暖灰 + 琥珀金）                                   |
| UI 组件  | shadcn/ui (Radix UI)    | Dialog/Select/Popover 等 + 自定义（Tag/RadioGroup/Drawer/Tabs） |
| 编辑器   | 原生 Textarea           | Tab 缩进，font-serif，居中 800px                                |
| 数据库   | Prisma ^5.14.0 + SQLite | 文件数据库 (prisma/novel.db)                                    |
| AI API   | DeepSeek（兼容 OpenAI） | 自定义 endpoint                                                 |
| 图标     | lucide-react ^1.23.0    | 2000+ SVG 图标                                                  |

## 开发环境

Node.js v22.12.0 / npm 8.15.0 / Windows 11 / VS Code

## 数据库模型

### Novel（作品）

`id` / `title` / `description?` / `genre`(JSON) / `status`(连载中/已完结/暂停) → Chapter[], Character[], Outline[], Brainstorm[]

### Chapter（章节）

`id` / `novelId` → Novel / `title` / `content` / `status`(draft/published) / `relatedCharacters`(JSON) / `sortOrder` → CharacterEmotion[]

### Character（人物）

`id` / `novelId` → Novel / `name` / `gender?` / `age?` / `identity?` / `traits`(JSON) → CharacterEmotion[]

**traits JSON**：item / narrativeFunction[] / innerMotivation[] / coreConflict / emotionExpression / abilities[] / relationships[] / growthArcs[] / notes[]

### PolishRule（润色规则，独立模型）

`id` / `name` / `description?` / `prompt` / `config`(JSON) / `type`(polish/continue/expand)

### Outline（计划中）

`id` / `novelId` / `parentId?` / `title` / `content?` / `type`(chapter/arc/plot/scene) / `sortOrder` / `startChapterId?` / `endChapterId?`

### CharacterEmotion（计划中）

`id` / `characterId` / `chapterId?` / `emotion` / `intensity`(1-10) / `state?` / `description?`

### Brainstorm（计划中）

`id` / `novelId` / `title` / `content` / `tags`(JSON) / `type`(idea/twist/setting/note)

## 关键配置

### 环境变量（需创建 .env.local）

```
AI_API_KEY=your_deepseek_api_key
AI_BASE_URL=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
```

### 脚本命令

`npm run dev` / `build` / `start` / `lint` / `db:push` / `db:reset`

### 已知问题

- 无 Markdown 预览（react-markdown 已安装未使用）
- 无分页机制
- 无数据导出
- AI API Key 需手动配置 .env.local
- 仅暗色模式，无亮色模式
