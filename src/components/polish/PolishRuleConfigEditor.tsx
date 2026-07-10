"use client"

import { PolishRuleConfig } from "@/types/polish"

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-medium text-muted-foreground mb-2">{children}</p>
)

function RadioGroup({
  options, value, onChange,
}: {
  options: string[]
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function MultiSelectGroup({
  options, selected, onChange, max,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  max?: number
}) {
  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      if (max && selected.length >= max) return
      onChange([...selected, opt])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        const disabled = max ? selected.length >= max && !isSelected : false
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : disabled
                  ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground border-border"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({
  value, onChange, label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      {children}
    </div>
  )
}

export function PolishRuleConfigEditor({
  config, onChange,
}: {
  config: PolishRuleConfig
  onChange: (c: PolishRuleConfig) => void
}) {
  function set<K extends keyof PolishRuleConfig>(key: K, value: PolishRuleConfig[K]) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Block title="界限（边界条件）">
        <div>
          <SectionLabel>节奏</SectionLabel>
          <RadioGroup
            options={["快", "中", "慢"]}
            value={config.pace}
            onChange={(v) => set("pace", v as "快" | "中" | "慢")}
          />
        </div>
        <div>
          <SectionLabel>情绪 / 氛围（最多选 2 项）</SectionLabel>
          <MultiSelectGroup
            options={["紧张", "压抑", "温馨", "荒诞", "沉重", "轻松", "悬疑", "悲怆"]}
            selected={config.mood}
            onChange={(v) => set("mood", v)}
            max={2}
          />
        </div>
        <div>
          <SectionLabel>叙事手法</SectionLabel>
          <RadioGroup
            options={["展示", "告知", "混合"]}
            value={config.narrative}
            onChange={(v) => set("narrative", v as "展示" | "告知" | "混合")}
          />
        </div>
      </Block>

      <Block title="侧重点">
        <div>
          <SectionLabel>五感通道</SectionLabel>
          <MultiSelectGroup
            options={["视觉", "听觉", "嗅觉", "味觉", "触觉"]}
            selected={config.senses}
            onChange={(v) => set("senses", v)}
          />
        </div>
        <div>
          <SectionLabel>人物描写</SectionLabel>
          <MultiSelectGroup
            options={["神态/微表情", "动作/小动作", "心理/内心独白", "语言/语气"]}
            selected={config.character}
            onChange={(v) => set("character", v)}
          />
        </div>
        <div>
          <SectionLabel>环境描写</SectionLabel>
          <MultiSelectGroup
            options={["空间/陈设", "光影/天气", "气味/声音"]}
            selected={config.environment}
            onChange={(v) => set("environment", v)}
          />
        </div>
      </Block>

      <Block title="手法">
        <div>
          <SectionLabel>修辞</SectionLabel>
          <RadioGroup
            options={["可多用比喻/拟人", "偏白描/克制", "适度排比"]}
            value={config.rhetoric}
            onChange={(v) => set("rhetoric", v)}
          />
        </div>
      </Block>

      <Block title="高级设置">
        <Toggle label="时间感与节奏变奏" value={config.timeVariation} onChange={(v) => set("timeVariation", v)} />
        <Toggle label="对比/反差插入" value={config.contrastInsertion} onChange={(v) => set("contrastInsertion", v)} />
      </Block>
    </div>
  )
}
