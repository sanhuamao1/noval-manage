# 当前工作上下文

## 状态

第一阶段基础功能已完成。Schema 已扩展到第二阶段模型，待实现对应功能。

## 最近完成

### 润色配置化改造 ✅
- PolishRule 新增 `config` JSON 字段
- 配置编辑器（界限/侧重点/高级设置 4 区块），单选/多选/开关
- `buildPolishPrompt` 将 config 转为 AI 指令

### 作品概览编辑 ✅
- Novel 新增 `genre`/`status`，PATCH 更新 API
- 预览+编辑双模式

### 人物管理 ✅
- 沃格勒叙事功能 12 种、皮尔逊内在动机 12 种
- 能力、关系、成长弧光、写作注意事项
- 右抽屉编辑（1060px，2s 防抖保存）

### 章节编辑增强 ✅
- 名称/时间排序、一键缩进格式化、PolishProvider 集成

### 润色规则重构 ✅
- 规则/样本双类型：PolishRule.type（base/sample）+ `useCount`
- **风格样本**：场景类型（战斗/对话/环境/心理）+ 正文（≤600字）+ 反例标记
- `buildStylePrompt()` 按正例/反例生成 Prompt
- Polish API 支持 `type: "rule"` 和 `type: "sample"` 双模式，自动递增 useCount
- PolishPanel 重构为规则/样本切换面板
- Polish 页面分为「润色规则」和「风格样本」两个独立区块
- 新增 `LongTextField`（多行文本 + 字数统计）
- 新增 `SampleEditor` 组件

### 配置系统 ✅
- `config-utils.ts` / `render-utils.tsx` 通用框架
- `polish-defs.ts` / `novel-defs.ts` / `character-defs.ts` 模块定义
- 支持 `longtext` 类型字段

## 下一步

1. **故事大纲**：树形大纲编辑器，拖拽排序，关联章节
2. **人物情感追踪**：章节内情感标记 + 曲线可视化
3. **头脑风暴**：灵感卡片 CRUD + AI 点子生成
4. **AI 续写/扩写**：类似润色，不同 prompt

## 关键文件

| 模块 | 文件 |
|------|------|
| 作品 | `novel/[id]/page.tsx` / `NovelOverviewEditor.tsx` / `NovelOverviewPreview.tsx` |
| 章节 | `chapters/page.tsx` / `ChapterEditor.tsx` |
| 人物 | `characters/page.tsx` / `CharacterEditor.tsx` / `character-defs.ts` |
| 润色 | `polish/page.tsx` / `PolishPanel.tsx` / `PolishContext.tsx` / `PolishRuleEditor.tsx` / `SampleEditor.tsx` |
| API | `api/polish/route.ts` / `api/polish/rules/route.ts` |
| 配置框架 | `config-utils.ts` / `render-utils.tsx` / `polish-defs.ts` |
| AI | `ai.ts` |
| DB | `prisma/schema.prisma` |
