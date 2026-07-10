# 当前工作上下文

## 当前状态
项目**第一阶段基础功能已全部完成**，数据库 Schema 已扩展到第二阶段所需模型（Outline / CharacterEmotion / Brainstorm），待实现对应的功能和页面。

## 最近完成的工作

### 润色规则配置化改造 ✅
- **Prisma 模型**：PolishRule 新增 `config` 字段（JSON 字符串），存储结构化配置
- **类型定义**：`src/types/polish.ts` — `PolishRuleConfig` 接口 + 默认值
- **配置元数据**：`src/lib/polish-config-meta.ts` — 每个配置选项的 AI 可读语义说明
- **配置编辑器组件**：`PolishRuleConfigEditor` — 4 个分类区块（界限/侧重点/手法/高级设置），支持单选/多选（上限2）/开关
- **AI 提示词封装**：`buildPolishPrompt` 将 config 转为结构化 AI 指令，未设置的选项自动跳过
- **规则管理页面**：创建/编辑弹窗集成配置编辑器，规则卡片显示配置摘要标签
- **侧边栏面板**：规则列表项显示精简配置摘要
- **API 和初始化脚本**：CRUD 支持 config，4 条默认规则配合理默认配置
- **修复**：修复 lucide-react 1.23.0 中 `Mask`/`Gate` 图标缺失导致的构建错误

### 作品概览编辑功能 ✅
- **Prisma 模型**：Novel 新增 `genre`（题材，JSON 数组存储）、`status`（连载中/已完结/暂停）字段
- **API**：新增 `PATCH /api/novels/[id]` 更新接口，GET 兼容序列化/纯字符串
- **概览页**：支持预览/编辑双模式
  - 编辑模式：Card 内联表单（标题 + 简介 + 题材多选网格 + 状态单选）
  - 预览模式：标题 / 状态 Tag / 题材 Tag 一行展示
- **题材多选**：12 种题材可选，JSON 数组存储于数据库
- **Tag 组件**：`src/components/ui/tag.tsx` — 封装复用，支持 `primary/success/warn/default` 四色 + 图标

### 侧边栏导航计数 ✅
- 章节/人物数量显示在导航项右侧

### Prisma Schema 扩展 ✅
- 添加 `PolishRule.type` 字段区分润色/续写/扩写
- 新增 `Outline` 模型（层级大纲，parentId 树形结构，支持关联章节）
- 新增 `CharacterEmotion` 模型（人物场景级情感标记）
- 新增 `Brainstorm` 模型（灵感卡片/头脑风暴）

## 接下来要处理的工作

### 短期（第二阶段核心功能）
1. **故事大纲** — 树形大纲编辑器（卷→章→情节→场景），拖拽排序，关联章节
2. **人物情感追踪** — 在章节编辑器中标记人物情感，情感变化曲线可视化
3. **头脑风暴** — 灵感卡片 CRUD + AI 点子生成
4. **AI 续写** — 基于上文自动续写，类似润色交互
5. **AI 扩写** — 选中文本智能扩写

### 优化项
1. 章节编辑器增强（Markdown 预览 / 关联人物选择）
2. 章节列表拖拽排序视觉反馈
3. 数据导出功能
4. 深色模式切换

### 第三阶段（远期）
- 多 Agent 协作（规划 + 写作 + 审稿）
- 事实核查
- RAG 知识库
- 版本管理

## 已知问题/待办事项
- [ ] 需创建 `.env.local` 配置文件才能使用 AI 功能
- [ ] 章节列表缺少拖拽排序视觉反馈
- [ ] 未配置 ESLint 规则
- [ ] 数据库初始化脚本需要验证

## 开发决策记录
1. **编辑器选择**：使用原生 Textarea，TipTap 依赖已安装但未启用
2. **人物数据结构**：JSON 字段存储结构化特征数据
3. **自动保存策略**：章节 3s 防抖，人物 2s 防抖
4. **路由设计**：`[id]` 动态路由组织子页面
5. **润色功能架构**：Context 模式管理状态，父组件仅提供 `editContent`/`setEditContent`/`editorRef`
6. **组件拆分原则**：按功能区域拆分为独立组件，页面层仅做布局编排
7. **PolishHistory 移除**：润色不记录历史
8. **润色面板布局**：收缩态按钮浮动在编辑器右上角；展开态侧边栏占用空间，按钮浮动在面板左侧
9. **编辑器居中**：Textarea 最大宽度 800px，水平居中
10. **题材多选存储**：JSON 数组字符串，兼容旧纯字符串格式
11. **Tag 组件**：通用可复用标签，支持 icon + 预设色值
12. **侧边栏计数**：从 API 的 `_count` 获取，导航项右侧展示
13. **大纲层级设计**：Outline 使用 parentId 实现树形结构，type 字段区分层级类型，关联起始/结束章节
14. **情感追踪设计**：CharacterEmotion 关联 Character + Chapter，支持场景级情绪标记和强度量化

## 关键文件映射
| 路径 | 说明 |
|------|------|
| `prisma/schema.prisma` | 数据库模型定义（含 Outline / CharacterEmotion / Brainstorm） |
| `src/app/novel/[id]/page.tsx` | 作品概览（预览 + 编辑双模式） |
| `src/app/novel/[id]/layout.tsx` | 作品内布局（侧边栏导航 + 导航计数） |
| `src/app/novel/[id]/chapters/page.tsx` | 章节管理（布局编排） |
| `src/app/novel/[id]/characters/page.tsx` | 人物管理 |
| `src/app/novel/[id]/polish/page.tsx` | 润色规则管理 |
| `src/components/polish/PolishContext.tsx` | 润色状态管理 Context |
| `src/components/polish/PolishPanel.tsx` | 右侧润色面板 |
| `src/components/polish/SelectionMenu.tsx` | 选中文本后的浮动"润色"按钮 |
| `src/components/polish/PolishResultPopover.tsx` | 润色结果浮层 |
| `src/components/chapters/ChapterEditor.tsx` | 编辑器 Textarea 组件 |
| `src/components/ui/tag.tsx` | Tag 标签组件 |
| `src/components/ui/card.tsx` | Card 卡片组件 |
| `src/components/radio-group.tsx` | 单选/多选按钮组 |
| `src/components/form-input.tsx` | 带图标表单输入 |
| `src/app/api/novels/route.ts` | 作品 API（含 JSON 兼容解析） |
| `src/app/api/novels/[id]/route.ts` | 作品更新 API |
| `src/app/api/polish/route.ts` | AI 润色/续写/扩写调用 |
| `src/app/api/polish/rules/route.ts` | 润色规则 CRUD |
| `src/lib/db.ts` | Prisma Client 封装 |
| `src/lib/ai.ts` | AI API 封装 |
