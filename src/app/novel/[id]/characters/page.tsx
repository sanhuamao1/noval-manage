"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button, AddButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash2, User, Venus, X, Mars, PenTool, UserRound, Shield, Heart, Briefcase, Gem, Calendar, Zap, Plus } from "lucide-react"
import { RadioGroup, MultiRadioGroup, type RadioOption } from "@/components/radio-group"
import { Card, CardHeader, CardContent, CardEmpty } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs"
import { FormInput } from "@/components/form-input"
import { SlidingDrawer } from "@/components/ui/drawer"
import {
  narrativeFunctionOptions,
  innerMotivationOptions,
  emotionOptions,
  archetypeIcons,
  type ArchetypeOption
} from "./data"

const genderOptions: RadioOption[] = [
  { value: "男", icon: Mars },
  { value: "女", icon: Venus },
]

// 创建带图标的 RadioOption
function createRadioOptionsWithIcons(
  options: ArchetypeOption[],
  iconMap: Record<string, React.ComponentType<{ className?: string }>>
): RadioOption[] {
  return options.map((opt) => ({
    value: opt.name,
    label: opt.label,
    description: opt.description,
    icon: iconMap[opt.name],
  }))
}

const narrativeFunctionRadioOptions = createRadioOptionsWithIcons(narrativeFunctionOptions, archetypeIcons)
const innerMotivationRadioOptions = createRadioOptionsWithIcons(innerMotivationOptions, archetypeIcons)

interface Character {
  id: string
  name: string
  gender: string | null
  age: string | null
  identity: string | null
  traits: string | null
}


interface Traits {
  item: string
  narrativeFunction: ArchetypeOption[]
  innerMotivation: ArchetypeOption[]
  coreConflict: string
  emotionExpression: string
  abilities: { name: string; description: string }[]
  relationships: { characterId: string; characterName: string; description: string }[]
  growthArcs: { flaw: string; manifestation: string; direction: string }[]
  notes: { key: string; value: string }[]
}

const defaultTraits: Traits = {
  item: "",
  narrativeFunction: [],
  innerMotivation: [],
  coreConflict: "",
  emotionExpression: "",
  abilities: [],
  relationships: [],
  growthArcs: [],
  notes: [
    { key: "破局方式", value: "" },
    { key: "关键行为模式", value: "" },
    { key: "角色危险性或潜力", value: "" },
  ],
}


export default function CharactersPage() {
  const params = useParams()
  const id = params.id as string
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [allChars, setAllChars] = useState<Character[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")

  const [editName, setEditName] = useState("")
  const [editGender, setEditGender] = useState("")
  const [editAge, setEditAge] = useState("")
  const [editIdentity, setEditIdentity] = useState("")
  const [editTraits, setEditTraits] = useState<Traits>(defaultTraits)

  useEffect(() => {
    fetchCharacters()
  }, [id])

  async function fetchCharacters() {
    const res = await fetch(`/api/characters?novelId=${id}`)
    const data = await res.json()
    setCharacters(data)
    setAllChars(data)
  }

  function selectCharacter(char: Character) {
    setSelectedChar(char)
    setEditName(char.name)
    setEditGender(char.gender || "")
    setEditAge(char.age || "")
    setEditIdentity(char.identity || "")
    setEditTraits(parseTraits(char.traits))
  }

  function parseTraits(traits: string | null): Traits {
    if (!traits) return { ...defaultTraits, notes: [...defaultTraits.notes] }
    try {
      const parsed = JSON.parse(traits)
      return {
        item: parsed.item || "",
        narrativeFunction: Array.isArray(parsed.narrativeFunction) ? parsed.narrativeFunction : [],
        innerMotivation: Array.isArray(parsed.innerMotivation) ? parsed.innerMotivation : [],
        coreConflict: parsed.coreConflict || "",
        emotionExpression: parsed.emotionExpression || "",
        abilities: parsed.abilities || [],
        relationships: parsed.relationships || [],
        growthArcs: parsed.growthArcs || [],
        notes: parsed.notes && parsed.notes.length > 0 ? parsed.notes : [...defaultTraits.notes],
      }
    } catch {
      return { ...defaultTraits, notes: [...defaultTraits.notes] }
    }
  }

  async function saveCharacter() {
    if (!selectedChar || !editName.trim()) return
    await fetch("/api/characters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedChar.id,
        name: editName,
        gender: editGender || null,
        age: editAge || null,
        identity: editIdentity || null,
        traits: JSON.stringify(editTraits),
      }),
    })
    fetchCharacters()
  }

  async function createCharacter() {
    if (!newName.trim()) return
    await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        novelId: id,
        name: newName.trim(),
        gender: null,
        age: null,
        identity: null,
        traits: JSON.stringify(defaultTraits),
      }),
    })
    setCreateOpen(false)
    setNewName("")
    fetchCharacters()
  }

  async function deleteCharacter(charId: string) {
    if (!confirm("确定要删除这个人物吗？")) return
    await fetch(`/api/characters?id=${charId}`, { method: "DELETE" })
    if (selectedChar?.id === charId) {
      setSelectedChar(null)
    }
    fetchCharacters()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedChar) saveCharacter()
    }, 2000)
    return () => clearTimeout(timer)
  }, [editName, editGender, editAge, editIdentity, editTraits])

  function addAbility() {
    setEditTraits({ ...editTraits, abilities: [...editTraits.abilities, { name: "", description: "" }] })
  }
  function updateAbility(index: number, field: string, value: string) {
    const abilities = [...editTraits.abilities]
    abilities[index] = { ...abilities[index], [field]: value }
    setEditTraits({ ...editTraits, abilities })
  }
  function removeAbility(index: number) {
    setEditTraits({ ...editTraits, abilities: editTraits.abilities.filter((_, i) => i !== index) })
  }

  function addRelationship() {
    setEditTraits({
      ...editTraits,
      relationships: [...editTraits.relationships, { characterId: "", characterName: "", description: "" }],
    })
  }
  function updateRelationship(index: number, field: string, value: string) {
    const relationships = [...editTraits.relationships]
    if (field === "characterId") {
      const char = allChars.find((c) => c.id === value)
      relationships[index] = { characterId: value, characterName: char?.name || "", description: relationships[index].description }
    } else {
      relationships[index] = { ...relationships[index], [field]: value }
    }
    setEditTraits({ ...editTraits, relationships })
  }
  function removeRelationship(index: number) {
    setEditTraits({ ...editTraits, relationships: editTraits.relationships.filter((_, i) => i !== index) })
  }

  function addGrowthArc() {
    setEditTraits({ ...editTraits, growthArcs: [...editTraits.growthArcs, { flaw: "", manifestation: "", direction: "" }] })
  }
  function updateGrowthArc(index: number, field: string, value: string) {
    const growthArcs = [...editTraits.growthArcs]
    growthArcs[index] = { ...growthArcs[index], [field]: value }
    setEditTraits({ ...editTraits, growthArcs })
  }
  function removeGrowthArc(index: number) {
    setEditTraits({ ...editTraits, growthArcs: editTraits.growthArcs.filter((_, i) => i !== index) })
  }

  function updateNote(index: number, value: string) {
    const notes = [...editTraits.notes]
    notes[index] = { ...notes[index], value }
    setEditTraits({ ...editTraits, notes })
  }

  return (
    <div className="flex h-full">
      {/* 左侧：人物卡片网格 */}
      <div className="flex-1 min-w-0 overflow-auto p-6">
        <div className="flex flex-col gap-4">
          {/* 标题行 */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <h2 className="font-semibold ml-1">人物列表</h2>
            <Popover open={createOpen} onOpenChange={setCreateOpen}>
              <PopoverTrigger asChild>
                <AddButton />
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-3">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="人物姓名"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        createCharacter()
                      }
                    }}
                  />
                  <Button onClick={createCharacter} className="w-full">
                    创建
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 人物卡片列表 */}
          <div className="flex flex-col gap-2">
            {characters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">还没有人物，点击上方按钮添加</p>
            ) : (
              characters.map((char) => (
                <div
                  key={char.id}
                  className={`group flex items-center gap-2 px-4 py-3 bg-bg-700 border rounded-lg cursor-pointer text-sm transition-all hover:bg-bg-600 hover:border-border-strong ${selectedChar?.id === char.id
                    ? "border-amber-500 shadow-glow"
                    : "border-border-default"
                    }`}
                  onClick={() => selectCharacter(char)}
                >
                  <span className="flex-1">{char.name}</span>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-danger/10 text-fg-tertiary hover:text-danger-light opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCharacter(char.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 右侧：编辑面板（抽拉展开） */}
      <SlidingDrawer
        open={selectedChar !== null}
        onClose={() => setSelectedChar(null)}
        width={1060}
      >
        <div className="px-14">
          {selectedChar ? (
            <div className="flex gap-8">
              <div className="flex-1 min-w-0 space-y-8">
                {/* 基本信息 */}
                <Card>
                  <CardHeader icon={UserRound} title="基本信息" />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <FormInput
                        label="姓名"
                        icon={PenTool}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <div className="space-y-2">
                        <Label>性别</Label>
                        <RadioGroup options={genderOptions} value={editGender} onChange={setEditGender} />
                      </div>
                      <FormInput
                        label="年龄"
                        icon={Calendar}
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        placeholder="如：25岁"
                      />
                      <FormInput
                        label="身份"
                        icon={Briefcase}
                        value={editIdentity}
                        onChange={(e) => setEditIdentity(e.target.value)}
                        placeholder="身份/职业/组织归属"
                      />
                      {/* 标志性物件 */}
                      <FormInput
                        label="标志性物件"
                        icon={Gem}
                        value={editTraits.item}
                        onChange={(e) => setEditTraits({ ...editTraits, item: e.target.value })}
                        placeholder="一件有故事的随身物品"
                      />
                    </div>
                    {/* 核心矛盾 */}
                    <FormInput
                      label="核心矛盾"
                      value={editTraits.coreConflict}
                      onChange={(e) => setEditTraits({ ...editTraits, coreConflict: e.target.value })}
                      placeholder="一句话概括"
                    />
                    {/* 情感表达方式 */}
                    <div>
                      <Label className="mb-0.5">情感表达方式</Label>
                      <RadioGroup
                        options={emotionOptions}
                        value={editTraits.emotionExpression}
                        onChange={(v) => setEditTraits({ ...editTraits, emotionExpression: v })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 能力 / 关系网络 / 成长弧光 */}
                <Tabs defaultValue="abilities">
                  <TabsList>
                    <TabsTrigger value="abilities" icon={Zap} label="能力" />
                    <TabsTrigger value="relationships" icon={Heart} label="关系网络" />
                    <TabsTrigger value="growthArcs" icon={Gem} label="成长弧光" />
                  </TabsList>


                  {/* 能力 */}
                  <TabsContent value="abilities" actionIcon={Plus} onAction={addAbility}>
                    {editTraits.abilities.length === 0 ? (
                      <CardEmpty>还没有能力，点击右上角"添加能力"</CardEmpty>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {editTraits.abilities.map((ability, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold flex-shrink-0">
                              {i + 1}
                            </span>
                            <Input
                              className="w-1/3"
                              value={ability.name}
                              onChange={(e) => updateAbility(i, "name", e.target.value)}
                              placeholder="擅长什么"
                            />
                            <Input
                              className="flex-1"
                              value={ability.description}
                              onChange={(e) => updateAbility(i, "description", e.target.value)}
                              placeholder="具体表现"
                            />
                            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0 text-fg-tertiary hover:bg-danger/10 hover:text-danger-light" onClick={() => removeAbility(i)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* 关系网络 */}
                  <TabsContent value="relationships" actionIcon={Plus} onAction={addRelationship}>
                    {editTraits.relationships.length === 0 ? (
                      <CardEmpty>还没有关系，点击右上角"添加关系"</CardEmpty>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {editTraits.relationships.map((rel, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold flex-shrink-0">
                              {i + 1}
                            </span>
                            <Select
                              value={rel.characterId}
                              onValueChange={(v) => updateRelationship(i, "characterId", v)}
                            >
                              <SelectTrigger className="w-1/3">
                                <SelectValue placeholder="选择角色" />
                              </SelectTrigger>
                              <SelectContent>
                                {allChars
                                  .filter((c) => c.id !== selectedChar.id)
                                  .map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Input
                              className="flex-1"
                              value={rel.description}
                              onChange={(e) => updateRelationship(i, "description", e.target.value)}
                              placeholder="与 TA 的关系"
                            />
                            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0 text-fg-tertiary hover:bg-danger/10 hover:text-danger-light" onClick={() => removeRelationship(i)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* 成长弧光 */}
                  <TabsContent value="growthArcs" actionIcon={Plus} onAction={addGrowthArc}>
                    {editTraits.growthArcs.length === 0 ? (
                      <CardEmpty>还没有弧光，点击右上角"添加弧光"</CardEmpty>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {editTraits.growthArcs.map((arc, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold flex-shrink-0">
                              {i + 1}
                            </span>
                            <Input
                              className="w-1/4"
                              value={arc.flaw}
                              onChange={(e) => updateGrowthArc(i, "flaw", e.target.value)}
                              placeholder="缺陷"
                            />
                            <Input
                              className="w-1/3"
                              value={arc.manifestation}
                              onChange={(e) => updateGrowthArc(i, "manifestation", e.target.value)}
                              placeholder="表现"
                            />
                            <Input
                              className="w-1/3"
                              value={arc.direction}
                              onChange={(e) => updateGrowthArc(i, "direction", e.target.value)}
                              placeholder="成长方向"
                            />
                            <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0 text-fg-tertiary hover:bg-danger/10 hover:text-danger-light" onClick={() => removeGrowthArc(i)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                </Tabs>

                {/* 写作注意事项 */}
                <Card>
                  <CardHeader icon={PenTool} title="写作注意事项" />
                  <CardContent className="grid grid-cols-2 gap-4 space-y-0">
                    {editTraits.notes.map((note, i) => (
                      <div key={i} className="space-y-1.5">
                        <Label className="text-xs text-fg-tertiary">{note.key}</Label>
                        <Input
                          value={note.value}
                          onChange={(e) => updateNote(i, e.target.value)}
                          placeholder={`${note.key}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="w-[300px] flex-shrink-0 space-y-6">
                {/* 叙事功能原型（沃格勒体系） */}
                <Card>
                  <CardHeader icon={Shield} title="叙事功能原型（沃格勒体系）" />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <MultiRadioGroup
                        options={narrativeFunctionRadioOptions}
                        selectedValues={editTraits.narrativeFunction.map((o) => o.name)}
                        onChange={(values) => {
                          setEditTraits({
                            ...editTraits,
                            narrativeFunction: values.map((val) => ({
                              label: narrativeFunctionOptions.find((o) => o.name === val)?.label || "",
                              name: val,
                              description: narrativeFunctionOptions.find((o) => o.name === val)?.description || "",
                            })),
                          })
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 内在动机原型（皮尔逊体系） */}
                <Card>
                  <CardHeader icon={Heart} title="内在动机原型（皮尔逊体系）" />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <MultiRadioGroup
                        options={innerMotivationRadioOptions}
                        selectedValues={editTraits.innerMotivation.map((o) => o.name)}
                        onChange={(values) => {
                          setEditTraits({
                            ...editTraits,
                            innerMotivation: values.map((val) => ({
                              label: innerMotivationOptions.find((o) => o.name === val)?.label || "",
                              name: val,
                              description: innerMotivationOptions.find((o) => o.name === val)?.description || "",
                            })),
                          })
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          ) : null}
        </div>
      </SlidingDrawer>
    </div>
  )
}