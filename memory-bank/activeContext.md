# 当前工作上下文

## 当前状态

项目**第一阶段基础功能已全部完成**，数据库 Schema 已扩展到第二阶段所需模型（Outline / CharacterEmotion / Brainstorm），待实现对应的功能和页面。

## 最近完成的工作

### 润色规则配置化改造 ✅

- PolishRule 新增 `config` JSON 字段存储结构化配置
- 配置编辑器（4 类区块：界限/侧重点/高级设置），支持单选/多选(上限2)/开关
- `buildPolishPrompt` 将 config 转为结构化 AI 指令，未设置选项自动跳过
- 规则卡片展示配置摘要标签

### 作品概览编辑功能 ✅

- Novel 新增 `genre`(JSON)/`status` 字段，PATCH 更新 API
- 预览/编辑双模式：Card 内联表单（标题+简介+题材多选网格+状态单选）

### 人物管理全面升级 ✅

- 沃格勒叙事功能原型 12 种、皮尔逊内在动机原型 12 种
- 能力（动态增删）、关系网络（Select 关联）、成长弧光（缺陷→表现→方向）
- 写作注意事项 3 项固定、右抽屉编辑（1060px，2s 防抖自动保存）

### 章节编辑增强 ✅

- 名称/时间排序、一键格式化缩进、PolishProvider 润色集成

### Prisma Schema 扩展 ✅

- PolishRule.type 字段（polish/continue/expand）
- 新增 Outline / CharacterEmotion / Brainstorm 模型

### 侧边栏导航计数 ✅

## 接下来要处理的工作

### 第二阶段核心功能

1. **故事大纲**：树形大纲编辑器（卷→章→情节→场景），拖拽排序，关联章节
2. **人物情感追踪**：章节内情感标记，情感变化曲线可视化
3. **头脑风暴**：灵感卡片 CRUD + AI 点子生成
4. **AI 续写/扩写**：类似润色交互，不同 prompt 策略

### 优化项

- 章节编辑器增强（Markdown 预览 / 关联人物选择）
- 章节列表拖拽排序视觉反馈
- 数据导出功能（TXT / EPUB）
- 深色模式切换

### 技术债

- 章节列表分页/虚拟列表
- ESLint 规则配置、单元测试
- 数据库初始化脚本验证

## 已知问题

- [ ] 需创建 `.env.local` 才能使用 AI 功能
- [ ] 无 Markdown 预览（react-markdown 已安装未使用）
- [ ] 仅暗色模式

## 关键文件映射

| 模块       | 文件                                                                                                     | 说明                                      |
| ---------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **核心**   | `layout.tsx` / `page.tsx` / `package.json` / `tailwind.config.ts`                                        | 全局布局 + 作品列表 + 项目配置 + 琥珀色板 |
| **作品**   | `novel/[id]/page.tsx` / `layout.tsx`                                                                     | 概览（预览/编辑） + 侧边栏导航计数        |
|            | `api/novels/route.ts` / `api/novels/[id]/route.ts`                                                       | 作品 CRUD + PATCH 更新                    |
| **章节**   | `chapters/page.tsx` / `ChapterEditor.tsx`                                                                | 章节列表 + 编辑器 + 润色集成              |
|            | `api/chapters/route.ts`                                                                                  | 章节 CRUD                                 |
| **人物**   | `characters/page.tsx` + `data.ts`                                                                        | 人物管理 + 原型数据                       |
|            | `api/characters/route.ts`                                                                                | 人物 CRUD                                 |
| **润色**   | `polish/page.tsx` / `PolishContext` / `PolishPanel` / `ResultPopover` / `SelectionMenu` / `ConfigEditor` | 规则管理 + 润色交互全流程                 |
|            | `api/polish/route.ts` / `api/polish/rules/route.ts`                                                      | 润色调用 + 规则 CRUD                      |
| **配置**   | `config-utils.ts` / `polish-defs.ts` / `render-utils.tsx`                                                | 配置系统框架 + 润色配置定义               |
| **工具**   | `db.ts` / `ai.ts` / `utils.ts`                                                                           | Prisma Client / AI API / 通用工具         |
| **数据库** | `prisma/schema.prisma`                                                                                   | 完整模型定义                              |
