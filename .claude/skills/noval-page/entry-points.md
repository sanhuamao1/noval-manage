# 入口文件规范

## 路由结构

```
src/app/
├── page.tsx                    # 首页 — 作品列表
├── layout.tsx                  # 根布局 — 全屏容器
└── novel/[id]/                 # 动态路由 — 小说详情页
    ├── layout.tsx              # 侧边栏 + 主内容区布局
    ├── page.tsx                # 概览页（默认路由）
    └── <feature>/              # 功能页面
        ├── page.tsx            # 页面入口
        └── <component>.tsx     # 页面专属组件（可选）
```

## 首页 (`src/app/page.tsx`)

展示作品列表，支持创建/删除/跳转。使用 `PageLayout` + `CardList` + `SimpleCard`，直接用 `api()` 发请求（不经过 store）。

## 小说详情页布局 (`src/app/novel/[id]/layout.tsx`)

**职责**：
1. 初始化小说数据：`useEffect(() => init(id), [id])`
2. 渲染侧边栏导航（`navItems` 数组）
3. 高亮当前导航项：`pathname.replace(/\/novel\/[^/]+/, "")`

**导航注册**：在 `layout.tsx` 的 `navItems` 数组中添加：

```tsx
const navItems = [
  { href: "", label: "概览", icon: BookOpen },
  { href: "/characters", label: "人物", icon: Users },
  // 新增：
  { href: "/my-feature", label: "新功能", icon: MyIcon },
]
```

**导航类型**：

| 类型 | 特征 | 示例 |
|------|------|------|
| CRUD 导航 | 对应配置驱动的 CRUD 页面 | characters, locations |
| 功能导航 | 特定业务功能的独立页面 | polish, factory |
| 数据导航 | 显示关联数据统计 | chapters（显示章节数） |

**原则**：
- 导航项是静态的，硬编码在 layout.tsx 中
- 图标使用 Lucide，href 相对于 `/novel/[id]`
- 初始化逻辑放在 layout 中，确保进入小说页时数据已加载

## 页面专属组件

当 `page.tsx` 逻辑超过 100 行时，拆分为 `<FeatureName>.tsx`，放在页面同级目录下。

**示例**：
```
factory/
├── page.tsx              # 页面入口
└── enrich-settings.tsx   # 完善设定组件