# Noval Manage - Project Instructions

## YAML 配置变更

修改 `configs/*.yml` 文件后，请立即执行：

```bash
node scripts/generate-configs.cjs
```

以同步生成 TypeScript 类型和配置代码。

## 验证流程

改完代码后，只做类型检查，不做生产构建：

```bash
npx tsc --noEmit
```

不要执行 `npm run build` 或 `next build`，太慢。
