# 当前工作上下文

## 当前状态
项目处于**第一阶段开发中**，核心基础功能已基本完成，正在进行细节完善和优化。

## 最近完成的工作
1. **项目骨架搭建完成**
   - Next.js 14 App Router 项目初始化
   - Tailwind CSS 配置完成
   - shadcn/ui 组件集成完成
   - Prisma + SQLite 数据库配置完成

2. **作品管理模块完成**
   - 作品 CRUD API
   - 作品列表页（含统计信息）
   - 创建/删除作品功能
   - 作品详情概览页

3. **章节管理模块完成**
   - 章节 CRUD API（含自动排序）
   - 章节列表 + 编辑器联动布局
   - 状态切换（草稿/定稿）过滤
   - 字数统计
   - 3 秒自动保存防抖

4. **人物管理模块完成**
   - 人物 CRUD API
   - 结构化特征数据（JSON 存储）
   - 原型选择器、能力、关系网络、成长弧光、写作注意事项
   - 2 秒自动保存防抖

5. **AI 润色模块重构完成** ✅
   - 润色规则 CRUD（独立管理页面 `/polish`）
   - DeepSeek API 调用集成
   - **章节编辑器内润色集成**：选中文本 → 上方弹菜单 → 右侧面板选择规则 → AI 润色 → 结果浮层确认替换
   - 抽取独立组件：`PolishContext`(状态管理) + `SelectionMenu` + `PolishResultPopover` + `PolishPanel` + `ChapterEditor`
   - 删除 `PolishHistory` 模型（不需要历史记录）
   - 恢复左侧导航"润色"入口用于规则管理

## 接下来要处理的工作
1. **章节编辑器增强**
   - 考虑集成 TipTap 富文本编辑器（依赖已安装）
   - 或保留 Textarea 但增加 Markdown 预览
   - 关联人物选择功能

2. **UI/UX 优化**
   - 深色模式切换
   - 更完善的加载/空状态

3. **数据管理增强**
   - 章节排序拖拽功能
   - 数据导出功能

4. **第二阶段规划**
   - 时间线管理
   - 关系图谱可视化
   - 伏笔追踪系统
   - 情节设计看板
   - AI 头脑风暴对话

## 已知问题/待办事项
- [ ] 需要创建 `.env.local` 配置文件才能使用 AI 功能
- [ ] 作品编辑功能（当前只能创建和删除，缺少修改名称/简介）
- [ ] 章节列表缺少拖拽排序的视觉反馈
- [ ] 人物关系网络目前只有文本编辑，缺少可视化
- [ ] 未配置 ESLint 规则（使用默认 next 配置）
- [ ] 数据库初始化脚本需要验证

## 开发决策记录
1. **编辑器选择**：当前使用原生 Textarea 进行文本编辑，TipTap 依赖已安装但未启用。原因是项目初期 Textarea 足够满足基本写作需求，且减少了复杂度。
2. **人物数据结构**：使用 JSON 字段存储所有结构化特征数据，保持数据库 schema 简洁，方便后期扩展新字段。
3. **自动保存策略**：章节 3s 防抖，人物 2s 防抖，平衡了数据安全和性能。
4. **路由设计**：作品使用 `[id]` 动态路由组织子页面（章节、人物、润色），通过布局组件共享侧边栏导航。
5. **润色功能架构**：使用 Context 模式（`PolishContext`）管理润色状态，所有润色相关状态和逻辑自包含在 Context 内部。父组件只需提供 `editContent`、`setEditContent` 和 `editorRef` 三个必要接口。
6. **组件拆分原则**：章节页面按功能区域拆分为独立组件——`ChapterEditor`（编辑器）、`SelectionMenu`（选中菜单）、`PolishResultPopover`（结果浮层）、`PolishPanel`（右侧面板），均通过 Context 通信，页面层约 170 行仅做布局编排。
7. **PolishHistory 移除**：润色不记录历史，API 不再接收 `chapterId` 参数，数据库表已删除。

## 关键文件映射

### 路由文件
| 路径 | 说明 |
|------|------|
| `src/app/page.tsx` | 首页（作品列表） |
| `src/app/layout.tsx` | 全局布局 |
| `src/app/novel/[id]/layout.tsx` | 作品内布局（侧边栏导航） |
| `src/app/novel/[id]/page.tsx` | 作品详情概览 |
| `src/app/novel/[id]/chapters/page.tsx` | 章节管理（~170行，引用各处组件） |
| `src/app/novel/[id]/characters/page.tsx` | 人物管理 |
| `src/app/novel/[id]/polish/page.tsx` | 润色规则 CRUD（仅规则管理，无润色工具） |

### API 路由
| 路径 | 说明 |
|------|------|
| `src/app/api/novels/route.ts` | 作品 CRUD |
| `src/app/api/chapters/route.ts` | 章节 CRUD |
| `src/app/api/characters/route.ts` | 人物 CRUD |
| `src/app/api/polish/route.ts` | AI 润色调用（只需 ruleId + text，无 chapterId） |
| `src/app/api/polish/rules/route.ts` | 润色规则 CRUD |

### 工具库
| 路径 | 说明 |
|------|------|
| `src/lib/db.ts` | Prisma 客户端单例 |
| `src/lib/ai.ts` | DeepSeek API 封装 |
| `src/lib/utils.ts` | 通用工具函数（cn, formatDate, wordCount） |

### 业务组件
| 路径 | 说明 |
|------|------|
| `src/components/polish/PolishContext.tsx` | 润色状态管理 Context（Provider + 所有逻辑） |
| `src/components/polish/SelectionMenu.tsx` | 选中文本后的浮动"润色"按钮 |
| `src/components/polish/PolishResultPopover.tsx` | 润色结果浮层（可编辑 + 确认/取消） |
| `src/components/polish/PolishPanel.tsx` | 右侧润色面板（收缩/展开 + 规则列表） |
| `src/components/chapters/ChapterEditor.tsx` | 编辑器 Textarea 组件 |
| `src/components/ui/*.tsx` | shadcn/ui 基础组件 |

### 配置文件
| 路径 | 说明 |
|------|------|
| `prisma/schema.prisma` | 数据库模型定义（已删除 PolishHistory） |
| `tailwind.config.ts` | Tailwind CSS 配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `next.config.mjs` | Next.js 配置 |
| `postcss.config.mjs` | PostCSS 配置 |
| `.env.local` | 环境变量（AI API Key 配置） |