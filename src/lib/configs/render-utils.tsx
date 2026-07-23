import {
    type ConfigFieldDef,
    type ConfigOption,
    type ConfigSection,
} from "@/types";
import { RadioGroup } from "@/components/ui/radio-group";
import { Toggle } from "@/components/ui/toggle";
import { ListField } from "@/components/ui/list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoBorderInput } from "@/components/ui/no-border-input";
import { FormItem } from "@/components/ui/form-item";
import { LongTextField } from "@/components/ui/long-text-field";
import { Tag } from "@/components/ui/tag";
import { Tags } from "@/components/ui/tags";
import { TagSelect } from "@/components/ui/tag-select";
import {
    CheckCheck, Plus,
    Activity, AlertTriangle, ArrowBigLeftDash, Book, BookMarked, BookOpen,
    Brain, Building2, Calendar, CheckCircle, Church, CircleCheck, CircleDot,
    CircleOff, Clock, CloudRain, Compass, Crown, DoorOpen, Eye, EyeOff,
    Feather, FileText, Flag, Flame, FlaskConical, Gamepad2, Ghost,
    GitFork, Globe, GraduationCap, Hand, Heart, Home, Info,
    Landmark, Laugh, Layers, Library, Link, Lock, Mail, Map, MapPin, Mars,
    MessageSquare, Moon, Orbit, Palette, PartyPopper, Pen, Rocket, Scissors,
    ScrollText, Search, SearchX, Shield, ShieldCheck, ShoppingBag, Skull,
    Snowflake, Sparkles, Star, Sun, Sword, Swords, Tag as TagIcon, Theater, Trees,
    TriangleAlert, UserRound, Users, Venus, Wand2, Waves, Wind, Zap,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";


/** 图标名称 → LucideIcon 的静态映射表（避免动态导入破坏 tree-shaking） */
const ICON_MAP: Record<string, LucideIcon | undefined> = {
    Activity, AlertTriangle, ArrowBigLeftDash, Book, BookMarked, BookOpen,
    Brain, Building2, Calendar, CheckCircle, Church, CircleCheck, CircleDot,
    CircleOff, Clock, CloudRain, Compass, Crown, DoorOpen, Eye, EyeOff,
    Feather, FileText, Flag, Flame, FlaskConical, Gamepad2, Ghost,
    GitFork, Globe, GraduationCap, Hand, Heart, Home, Info,
    Landmark, Laugh, Layers, Library, Link, Lock, Mail, Map, MapPin, Mars,
    MessageSquare, Moon, Orbit, Palette, PartyPopper, Pen, Rocket, Scissors,
    ScrollText, Search, SearchX, Shield, ShieldCheck, ShoppingBag, Skull,
    Snowflake, Sparkles, Star, Sun, Sword, Swords, Tag: TagIcon, Theater, Trees,
    TriangleAlert, UserRound, Users, Venus, Wand2, Waves, Wind, Zap,
};

/** 将 icon 名称字符串映射到 LucideIcon（使用静态映射，确保 tree-shaking 生效） */
export function resolveIcon(name: string | undefined): LucideIcon | undefined {
    if (!name) return undefined;
    return ICON_MAP[name] ?? undefined;
}


export const renderOptions = (options: ConfigOption[] | undefined, values: string | string[] | undefined) => {
    if (options === undefined) return
    if (values === undefined) return
    if (Array.isArray(values)) {
        return options.map(op => {
            if (values.includes(op.value)) {
                return <Tag
                    key={op.value}
                    color={op.color || "default"}
                    icon={op.icon ? resolveIcon(op.icon) : undefined}
                >
                    {op.value}
                </Tag>
            }
        })
    } else {
        const op = options.find(e => e.value === values)
        return op ? <Tag
            key={op.value}
            color={op.color || "default"}
            icon={op.icon ? resolveIcon(op.icon) : undefined}
        >
            {op.value}
        </Tag> : null
    }
}

/** 将 ConfigOption 转换为 RadioOption（含 icon 解析） */
function toRadioOption(opt: ConfigOption) {
    const Icon = resolveIcon(opt.icon);
    return { ...opt, icon: Icon };
}

/** 渲染单个配置字段 */
export function renderField<T extends Record<string, any>>(
    field: ConfigFieldDef,
    config: T,
    onChange: (c: T) => void,
    novelId?: string,
) {

    console.log(config)
    function set(key: keyof T, value: T[keyof T]) {
        onChange({ ...config, [key]: value });
    }

    const value = (config as any)[field.key];

    const sharedProps = {
        display: field.display,
        innerDisplay: field.innerDisplay,
        mergeCells: field.mergeCells,
        type: field.type
    };


    let control: ReactNode = null;
    let handlerEl: ReactNode = undefined;

    switch (field.type) {
        case "toggle":
            control = (
                <Toggle
                    value={value as boolean}
                    onChange={(v) => set(field.key as keyof T, v as any)}
                />
            );
            break;

        case "single": {
            const radioOptions = (field.options ?? []).map(toRadioOption);
            control = (
                <RadioGroup
                    options={radioOptions}
                    value={(value as string) || ""}
                    onChange={(v) => set(field.key as keyof T, v as any)}
                    variant={field.variant as "box" | undefined}
                />
            );
            break;
        }

        case "multi": {
            const radioOptions = (field.options ?? []).map(toRadioOption);
            const selected = (value as string[]) || [];
            const isAllSelected = selected.length === radioOptions.length;

            if (field.max === undefined) {
                handlerEl = (
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
                );
            }

            control = (
                <RadioGroup
                    type="multi"
                    options={radioOptions}
                    value={selected}
                    onChange={(v) => set(field.key as keyof T, v as any)}
                    max={field.max}
                    variant={field.variant as "box" | undefined}
                />
            );
            break;
        }

        case "text": {
            const textValue = (value as string) ?? "";
            control = (
                <Input
                    value={textValue}
                    onChange={(e) => set(field.key as keyof T, e.target.value as any)}
                    placeholder={field.placeholder}
                />
            );
            break;
        }

        case "longtext": {
            const textValue = (value as string) ?? "";
            const maxLength = field.maxLength ?? 1000;
            control = (
                <LongTextField
                    key={field.key}
                    value={textValue}
                    maxLength={maxLength}
                    placeholder={field.placeholder}
                    onChange={(v) => set(field.key as keyof T, v as any)}
                />
            );
            break;
        }

        case "tagselect": {
            const selectedIds = (value as string[]) || [];
            if (!novelId) return null;
            control = (
                <TagSelect
                    label={field.label}
                    entity={field.entity!}
                    novelId={novelId}
                    selectedIds={selectedIds}
                    onChange={(ids) => set(field.key as keyof T, ids as any)}
                    optionValue={field.optionValue}
                    optionLabel={field.optionLabel}
                />
            );
            break;
        }

        case "tags": {
            control = (
                <Tags
                    value={(value as string[]) || []}
                    onChange={(values) => set(field.key as keyof T, values as any)}
                />
            );
            break;
        }

        case "list": {
            const listValues = (value as string[]) || [];
            const isEmpty = listValues.length === 0;

            // 解析 subFields 中的 optionsFrom / entity，生成选项
            const resolvedOpts: Record<number, string[]> = {};
            if (field.subFields) {
                field.subFields.forEach((sf, fi) => {
                    if (sf.type === "select") {
                        if (sf.optionsFrom) {
                            const sourceList = (config as any)[sf.optionsFrom] as string[] | undefined;
                            if (sourceList && Array.isArray(sourceList)) {
                                // 提取引用字段每个 item 的第一个子值（用 ; 分隔）
                                resolvedOpts[fi] = sourceList
                                    .map((item) => item.split(";")[0]?.trim())
                                    .filter(Boolean);
                            }
                        } else if (sf.entity) {
                            // entity 引用：在 SWR 模式下略过预解析选项
                            // 用户仍可直接输入，不影响功能
                            resolvedOpts[fi] = [];
                        }
                    }
                });
            }

            control = isEmpty ? (
                <div className="flex items-center justify-center py-6 text-sm text-fg-tertiary">
                    点击右上角 <Plus className="w-3.5 h-3.5 inline mx-1" /> 添加
                </div>
            ) : (
                <ListField
                    subFields={field.subFields ?? []}
                    values={listValues}
                    onChange={(v) => set(field.key as keyof T, v as any)}
                    resolvedOptions={resolvedOpts}
                />
            );
            break;
        }

        default:
            return null;
    }

    return (
        <FormItem
            key={field.key}
            label={field.noLabel ? undefined : field.label}
            {...sharedProps}
            handler={handlerEl}
        >
            {control}
        </FormItem>
    );
}

/** 渲染配置 sections */
export function renderSections<T extends Record<string, any>>(
    sections: ConfigSection[],
    config: T,
    onChange: (c: T) => void,
    novelId?: string,
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

            // 子字段中有 list 类型时，在 CardHeader 右侧显示添加按钮
            const listItem = section.children.length === 1 && section.children.find(f => f.type === "list") as any;
            const rightHandlerNode = listItem ? (
                    <Button
                            key={listItem.key}
                            variant="ghost"
                            size="auto"
                            onClick={() => {
                                const currentValue = ((config as any)[listItem.key] as string[]) || [];
                                const emptyRow = ";".repeat((listItem.subFields?.length ?? 1) - 1);
                                onChange({
                                    ...config,
                                    [listItem.key]: [...currentValue, emptyRow],
                                } as T);
                            }}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
            ) : undefined;

            const headerEl = SectionIcon ? (
                <CardHeader icon={SectionIcon} title={titleNode} rightHandler={rightHandlerNode} />
            ) : (
                <CardHeader title={titleNode} rightHandler={rightHandlerNode} />
            );

            return (
                <Card key={index}>
                    {headerEl}
                    <CardContent className={section.class?section.class:'space-y-1.5'}>
                        {section.children
                            .filter((f): f is ConfigFieldDef => f.type !== "tab-group")
                            .map((field) => renderField(field, config, onChange, novelId))}
                    </CardContent>
                </Card>
            );
        } else if (section.type === "tabs") {
            const filteredChildren = section.children;
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
                                    {child.children.map((field) => renderField(field, config, onChange, novelId))}
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
                                {renderField({ ...child }, config, onChange, novelId)}
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
                        const span = (subSection as any).colspan ?? 1;
                        return (
                            <div key={subIndex} style={{ gridColumn: `span ${span}` }}>
                                {renderSections([subSection], config, onChange, novelId)}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    });
}


