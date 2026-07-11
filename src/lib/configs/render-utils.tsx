import {
    type ConfigFieldDef,
    type ConfigOption,
    type ConfigSection,
    type TabGroup,
} from "@/lib/configs/config-utils";
import { RadioGroup } from "@/components/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { ListField } from "@/components/form-list";
import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { CheckCheck, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NoBorderInput } from "@/components/ui/no-border-input";
import { FormItem } from "@/components/form-item";
import type { ReactNode } from "react";
import { LongTextField } from "@/components/long-text-field";

/** 从配置对象中提取标签文本数组 */
export function buildConfigTags(
    config: Record<string, unknown>,
    items: [string, string][],
): string[] {
    const tags: string[] = [];
    for (const [label, key] of items) {
        const value = config[key];
        if (typeof value === "boolean") {
            if (value) tags.push(label);
        } else if (typeof value === "string") {
            if (value) tags.push(`${label}：${value}`);
        } else if (Array.isArray(value)) {
            if (value.length > 0) tags.push(`${label}：${value.filter(Boolean).join("/")}`);
        }
    }
    return tags;
}

/** 将 icon 名称字符串映射到 LucideIcon */
export function resolveIcon(name: string | undefined): LucideIcon | undefined {
    if (!name) return undefined;
    const icon = LucideIcons[name as keyof typeof LucideIcons];
    return (icon as LucideIcon) ?? undefined;
}

/** 将 ConfigOption 转换为 RadioOption（含 icon 解析） */
function toRadioOption(opt: ConfigOption) {
    const Icon = resolveIcon(opt.icon);
    return { ...opt, icon: Icon };
}

/** 过滤掉指定 key 的字段 */
function filterFields(
    fields: (ConfigFieldDef | TabGroup)[],
    skipKeys?: string[],
): (ConfigFieldDef | TabGroup)[] {
    if (!skipKeys || skipKeys.length === 0) return fields;
    return fields.filter((f) => !skipKeys.includes(f.key));
}

/** 渲染单个配置字段 */
export function renderField<T extends Record<string, unknown>>(
    field: ConfigFieldDef,
    config: T,
    onChange: (c: T) => void,
) {
    function set(key: keyof T, value: T[keyof T]) {
        onChange({ ...config, [key]: value });
    }

    const value = (config as any)[field.key];

    const hideLabel = field.noLabel ?? false;

    const sharedProps = {
        display: field.display || "default",
        flexCols: field.cols,
        className: field.className,
        key: field.key,
    };

    if (field.type === "toggle") {
        const control = (
            <Toggle
                value={value as boolean}
                onChange={(v) => set(field.key as keyof T, v as any)}
            />
        );
        if (hideLabel) return <FormItem {...sharedProps}>{control}</FormItem>;
        return <FormItem label={field.label} {...sharedProps}>{control}</FormItem>;
    }

    if (field.type === "single") {
        const radioOptions = (field.options ?? []).map(toRadioOption);
        const control = (
            <RadioGroup
                options={radioOptions}
                value={(value as string) || ""}
                onChange={(v) => set(field.key as keyof T, v as any)}
                variant={field.variant as "box" | undefined}
            />
        );
        if (hideLabel) return <FormItem {...sharedProps}>{control}</FormItem>;
        return <FormItem label={field.label} {...sharedProps}>{control}</FormItem>;
    }

    // multi
    if (field.type === "multi") {
        const radioOptions = (field.options ?? []).map(toRadioOption);
        const selected = value as string[];
        const isAllSelected = selected.length === radioOptions.length;

        const sholdShowHandler = field.max === undefined;

        const handlerEl = sholdShowHandler ? (
            <Button
                variant="radio"
                size="auto"
                isActive={isAllSelected}
                onClick={() =>
                    set(
                        field.key as keyof T,
                        (isAllSelected
                            ? []
                            : [...radioOptions.map((o) => o.value)]) as any,
                    )
                }
            >
                <CheckCheck className="w-2.5 h-2.5" />
            </Button>
        ) : undefined;

        const control = (
            <RadioGroup
                type="multi"
                options={radioOptions}
                value={selected}
                onChange={(v) => set(field.key as keyof T, v as any)}
                max={field.max}
                variant={field.variant as "box" | undefined}
            />
        );
        if (hideLabel) return <FormItem {...sharedProps}>{control}</FormItem>;
        return (
            <FormItem label={field.label} {...sharedProps} handler={handlerEl}>
                {control}
            </FormItem>
        );
    }

    // text
    if (field.type === "text") {
        const textValue = (value as string) ?? "";
        const control = (
            <FormInput
                label={field.label}
                value={textValue}
                onChange={(e) => set(field.key as keyof T, e.target.value as any)}
                placeholder={field.placeholder}
            />
        );
        if (hideLabel) return <div className={sharedProps.className}>{control}</div>;
        return <div className={sharedProps.className}>{control}</div>;
    }

    // longtext (多行文本，带字数限制)
    if (field.type === "longtext") {
        const textValue = (value as string) ?? "";
        const maxLength = field.maxLength ?? 1000;
        const control = (
            <LongTextField
                value={textValue}
                maxLength={maxLength}
                placeholder={field.placeholder}
                label={field.label}
                onChange={(v) => set(field.key as keyof T, v as any)}
            />
        );
        return <div className={sharedProps.className}>{control}</div>;
    }

    // list
    const listValues = (value as string[]) || [];
    const isEmpty = listValues.length === 0 || listValues.every((v) => !v.trim());

    const control = isEmpty ? (
        <div className="flex items-center justify-center py-6 text-sm text-fg-tertiary">
            点击右上角 <Plus className="w-3.5 h-3.5 inline mx-1" /> 添加
        </div>
    ) : (
        <ListField
            label={field.label}
            subFields={field.subFields ?? []}
            values={listValues}
            onChange={(v) => set(field.key as keyof T, v as any)}
        />
    );
    if (hideLabel) return <FormItem {...sharedProps}>{control}</FormItem>;
    return <FormItem label={field.label} {...sharedProps}>{control}</FormItem>;
}

/** 渲染配置 sections */
export function renderSections<T extends Record<string, unknown>>(
    sections: ConfigSection[],
    config: T,
    onChange: (c: T) => void,
    skipKeys?: string[],
) {
    return sections.map((section, index) => {
        if (section.type === "card") {
            const SectionIcon = section.icon ? resolveIcon(section.icon) : undefined;

            // 动态标题：从 config 中读取 titleKey 对应的值
            const titleValue = section.titleKey
                ? ((config as any)[section.titleKey] as string) ?? section.title
                : section.title;

            const isEditable = section.titleKey && section.titleEditable;

            const titleNode: ReactNode = isEditable ? (
                <NoBorderInput
                    value={titleValue}
                    onChange={(e) =>
                        onChange({
                            ...config,
                            [section.titleKey as string]: e.target.value,
                        } as T)
                    }
                    placeholder={section.title}
                />
            ) : (
                titleValue
            );

            const headerEl = SectionIcon ? (
                <CardHeader icon={SectionIcon} title={titleNode} />
            ) : (
                <CardHeader title={titleNode} />
            );

            return (
                <Card key={index}>
                    {headerEl}
                    <CardContent className={section.class}>
                        {filterFields(section.children, skipKeys)
                        .filter((f): f is ConfigFieldDef => f.type !== "tab-group")
                        .map((field) => renderField(field, config, onChange))}
                    </CardContent>
                </Card>
            );
        } else if (section.type === "tabs") {
            const filteredChildren = filterFields(section.children, skipKeys);
            const firstKey = filteredChildren[0]?.key ?? "";
            return (
                <Tabs key={index} defaultValue={firstKey}>
                    <TabsList>
                        {filteredChildren.map((child) => {
                            const ChildIcon = child.icon ? resolveIcon(child.icon) : undefined;
                            return (
                                <TabsTrigger
                                    key={child.key}
                                    value={child.key}
                                    label={child.label}
                                    icon={ChildIcon}
                                />
                            );
                        })}
                    </TabsList>
                    {filteredChildren.map((child) => {
                        if (child.type === "tab-group") {
                            return (
                                <TabsContent key={child.key} value={child.key} className={child.class ?? section.class}>
                                    {child.children.map((field) => renderField(field, config, onChange))}
                                </TabsContent>
                            );
                        }
                        return (
                            <TabsContent
                                key={child.key}
                                value={child.key}
                                className={section.class}
                                onAdd={child.type === "list"
                                    ? () => {
                                        const currentValue = ((config as any)[child.key] as string[]) || [];
                                        const emptyRow = ";".repeat((child.subFields?.length ?? 1) - 1);
                                        onChange({
                                            ...config,
                                            [child.key]: [...currentValue, emptyRow],
                                        } as T);
                                    }
                                    : undefined}
                            >
                                {renderField({ ...child}, config, onChange)}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            );
        } else if (section.type === "grid") {
            const cols = section.cols;
            return (
                <div key={index} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {section.sections.map((subSection, subIndex) => {
                        const span = subSection.colspan ?? 1;
                        return (
                            <div key={subIndex} style={{ gridColumn: `span ${span}` }}>
                                {renderSections([subSection], config, onChange, skipKeys)}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    });
}

/** 将配置对象的指定字段渲染为摘要标签 */
export function ConfigBadges({ tags }: { tags: string[] }) {
    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((t) => (
                <span
                    key={t}
                    className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground"
                >
                    {t}
                </span>
            ))}
        </div>
    );
}
