# 当前工作上下文

## 当前状态
项目处于**第一阶段开发中**，核心基础功能已完成，正在进行细节完善和优化。

## 最近完成的工作
1. **项目骨架搭建完成** — Next.js 14 + Tailwind + shadcn/ui + Prisma/SQLite
2. **作品管理模块** — CRUD API + 列表页 + 详情页
3. **章节管理模块** — CRUD API + 编辑器联动 + 状态过滤 + 自动保存防抖
4. **人物管理模块** — CRUD API + 结构化特征数据 + 自动保存防抖
5. **AI 润色模块重构完成** ✅
   - 润色规则 CRUD（独立管理页面 `/polish`）
   - 章节编辑器内润色：选中文本 → 浮动菜单 → 右侧面板选择规则 → AI 润色 → 结果浮层确认替换
   - 组件：`PolishContext`(状态管理) + `SelectionMenu` + `PolishResultPopover` + `PolishPanel` + `ChapterEditor`
   - 删除 `PolishHistory` 模型
6. **润色面板布局优化** ✅
   - 收缩态：按钮浮动在编辑器右上角，不占布局空间
   - 展开态：侧边栏占用空间（w-72 border-l），按钮浮动在面板左侧
   - 从选中文本菜单点击润色时，tab 按钮正确高亮
7. **编辑器居中布局** ✅
   - Textarea 添加 `mx-auto max-w-[800px]` 样式，内容水平居中

## 接下来要处理的工作
1. 章节编辑器增强（Markdown 预览 / 关联人物选择）
2. 深色模式切换
3. 章节排序拖拽功能
4. 数据导出功能
5. 第二阶段：时间线管理、关系图谱、伏笔追踪、情节看板

## 已知问题/待办事项
- [ ] 需创建 `.env.local` 配置文件才能使用 AI 功能
- [ ] 作品编辑功能（缺少修改名称/简介）
- [ ] 章节列表缺少拖拽排序视觉反馈
- [ ] 人物关系网络缺少可视化
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

## 关键文件映射
| 路径 | 说明 |
|------|------|
| `src/app/novel/[id]/chapters/page.tsx` | 章节管理（布局编排） |
| `src/components/polish/PolishContext.tsx` | 润色状态管理 Context |
| `src/components/polish/PolishPanel.tsx` | 右侧润色面板（浮动按钮 + 侧边栏） |
| `src/components/polish/SelectionMenu.tsx` | 选中文本后的浮动"润色"按钮 |
| `src/components/polish/PolishResultPopover.tsx` | 润色结果浮层（可编辑 + 确认/取消） |
| `src/components/chapters/ChapterEditor.tsx` | 编辑器 Textarea 组件 |
| `src/app/api/polish/route.ts` | AI 润色调用 |
| `src/app/api/polish/rules/route.ts` | 润色规则 CRUD |