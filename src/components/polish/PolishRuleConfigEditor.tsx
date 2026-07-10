"use client"

import { type PolishConfig, CONFIG_FIELDS } from "@/lib/configs/polish-defs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Gauge, Target, Settings, type LucideIcon } from "lucide-react"
import { renderField } from "@/lib/configs/render-utils"

const SECTION_ICONS: Record<string, LucideIcon> = {
  "界限": Gauge,
  "侧重点": Target,
  "高级设置": Settings,
}
const SECTION_TITLES: Record<string, string> = {
  "界限": "界限（边界条件）",
  "侧重点": "侧重点",
  "高级设置": "高级设置",
}


export function PolishRuleConfigEditor({
  config, onChange,
}: {
  config: PolishConfig
  onChange: (c: PolishConfig) => void
}) {
  const sections = Array.from(new Set(CONFIG_FIELDS.map((f) => f.section)))
  const [section1, section2] = sections.slice(0, 2)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[section1, section2].map((sec) => {
          const fields = CONFIG_FIELDS.filter((f) => f.section === sec)
          if (fields.length === 0) return null
          const Icon = SECTION_ICONS[sec]
          return (
            <Card key={sec}>
              {Icon && <CardHeader icon={Icon} title={SECTION_TITLES[sec] || sec} />}
              <CardContent className="space-y-3">
                {fields.map((f) => renderField(f, config, onChange))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sections.slice(2).map((sec) => {
        const fields = CONFIG_FIELDS.filter((f) => f.section === sec)
        if (fields.length === 0) return null
        const Icon = SECTION_ICONS[sec]
        return (
          <Card key={sec}>
            {Icon && <CardHeader icon={Icon} title={SECTION_TITLES[sec] || sec} />}
            <CardContent className="space-y-3">
              {fields.map((f) => renderField(f, config, onChange))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
