import { Tag } from "./tag"

/** 从配置对象中提取标签文本数组 */
function buildConfigTags<T>(
  config: T,
  items: readonly [string, string & keyof T][],
): string[] {
  const tags: string[] = []
  for (const [label, key] of items) {
    const value = config[key]
    if (typeof value === "boolean") {
      if (value) tags.push(label)
    } else if (typeof value === "string") {
      if (value) tags.push(`${label}：${value}`)
    } else if (Array.isArray(value)) {
      if (value.length > 0) tags.push(`${label}：${value.filter(Boolean).join("/")}`)
    }
  }
  return tags
}

interface ConfigBadgesProps<T> {
  config: T
  items: readonly [string, string & keyof T][]
}

/** 将配置对象的指定字段渲染为摘要标签 */
export function ConfigBadges<T>({ config, items }: ConfigBadgesProps<T>) {
  const tags = buildConfigTags(config, items)
  if (tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map((t) => (
        <Tag key={t} variant="sharp">
          {t}
        </Tag>
      ))}
    </div>
  )
}
