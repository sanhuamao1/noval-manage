"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, User, Venus, X, Mars, PenTool } from "lucide-react"
import { RadioGroup, type RadioOption } from "@/components/radio-group"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { FormInput } from "@/components/form-input"
import { 
  narrativeFunctionOptions, 
  innerMotivationOptions, 
  emotionOptions,
  type ArchetypeOption 
} from "./data"

const genderOptions: RadioOption[] = [
  { value: "男", icon: Mars },
  { value: "女", icon: Venus },
]

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
  abilities: [],
  relationships: [],
  growthArcs: [],
  notes: [
    { key: "破局方式", value: "" },
    { key: "关键行为模式", value: "" },
    { key: "情感表达方式", value: "" },
    { key: "角色危险性或潜力", value: "" },
  ],
}


export default function CharactersPage() {
  const params = useParams()
  const id = params.id as string
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [allChars, setAllChars] = useState<Character[]>([])

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
    const name = prompt("请输入人物姓名")
    if (!name?.trim()) return
    await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        novelId: id,
        name: name.trim(),
        gender: null,
        age: null,
        identity: null,
        traits: JSON.stringify(defaultTraits),
      }),
    })
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

  function toggleNarrativeFunction(option: ArchetypeOption) {
    const current = editTraits.narrativeFunction
    const exists = current.some((o) => o.name === option.name)
    if (exists) {
      setEditTraits({ ...editTraits, narrativeFunction: current.filter((o) => o.name !== option.name) })
    } else {
      setEditTraits({ ...editTraits, narrativeFunction: [...current, option] })
    }
  }

  function toggleInnerMotivation(option: ArchetypeOption) {
    const current = editTraits.innerMotivation
    const exists = current.some((o) => o.name === option.name)
    if (exists) {
      setEditTraits({ ...editTraits, innerMotivation: current.filter((o) => o.name !== option.name) })
    } else {
      setEditTraits({ ...editTraits, innerMotivation: [...current, option] })
    }
  }

  return (
    <div className="flex h-full">
      {/* 左侧人物列表 */}
      <div className="w-64 border-r p-4 overflow-auto flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="w-4 h-4" />
            <h2 className="font-semibold ml-1">人物列表</h2>
          </div>
          <Button size="icon" className="rounded-lg" onClick={createCharacter}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {characters.map((char) => (
            <div
              key={char.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${selectedChar?.id === char.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
                }`}
              onClick={() => selectCharacter(char)}
            >
              <span className="flex-1 truncate">{char.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteCharacter(char.id)
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
          {characters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">还没有人物，点击上方按钮添加</p>
          )}
        </div>
      </div>

      {/* 右侧编辑区 */}
      <div className="flex-1 overflow-auto">
        {selectedChar ? (
          <div className="max-w-3xl mx-auto p-6 space-y-8">
            {/* 基本信息 */}
            <Card>
              <CardHeader icon={User} title="基本信息" />
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
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
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="如：25岁"
                  />
                  <FormInput
                    label="身份"
                    value={editIdentity}
                    onChange={(e) => setEditIdentity(e.target.value)}
                    placeholder="身份/职业/组织归属"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 特征数据 */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">特征</h3>
              <div className="space-y-6">
                {/* 标志性物件 */}
                <div>
                  <Label>标志性物件</Label>
                  <Input
                    value={editTraits.item}
                    onChange={(e) => setEditTraits({ ...editTraits, item: e.target.value })}
                    placeholder="一件有故事的随身物品"
                  />
                </div>

                {/* 叙事功能原型（沃格勒体系） */}
                <div>
                  <Label>叙事功能原型（沃格勒体系）</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {narrativeFunctionOptions.map((opt) => {
                      const isSelected = editTraits.narrativeFunction.some((o) => o.name === opt.name)
                      return (
                        <button
                          key={opt.name}
                          onClick={() => toggleNarrativeFunction(opt)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary"
                            }`}
                          title={opt.description}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 内在动机原型（皮尔逊体系） */}
                <div>
                  <Label>内在动机原型（皮尔逊体系）</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {innerMotivationOptions.map((opt) => {
                      const isSelected = editTraits.innerMotivation.some((o) => o.name === opt.name)
                      return (
                        <button
                          key={opt.name}
                          onClick={() => toggleInnerMotivation(opt)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary"
                            }`}
                          title={opt.description}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 核心矛盾 */}
                <div>
                  <Label>核心矛盾</Label>
                  <Input
                    value={editTraits.coreConflict}
                    onChange={(e) => setEditTraits({ ...editTraits, coreConflict: e.target.value })}
                    placeholder="一句话概括"
                  />
                </div>

                {/* 能力 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>能力</Label>
                    <Button variant="outline" size="sm" onClick={addAbility}>
                      <Plus className="w-3 h-3 mr-1" />添加能力
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editTraits.abilities.map((ability, i) => (
                      <div key={i} className="flex gap-2 items-start">
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
                        <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => removeAbility(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 关系网络 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>关系网络</Label>
                    <Button variant="outline" size="sm" onClick={addRelationship}>
                      <Plus className="w-3 h-3 mr-1" />添加关系
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editTraits.relationships.map((rel, i) => (
                      <div key={i} className="flex gap-2 items-start">
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
                        <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => removeRelationship(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 成长弧光 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>成长弧光</Label>
                    <Button variant="outline" size="sm" onClick={addGrowthArc}>
                      <Plus className="w-3 h-3 mr-1" />添加弧光
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editTraits.growthArcs.map((arc, i) => (
                      <div key={i} className="flex gap-2 items-start">
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
                        <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => removeGrowthArc(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 写作注意事项 */}
                <div>
                  <Label>写作注意事项</Label>
                  <div className="space-y-3 mt-2">
                    {editTraits.notes.map((note, i) => (
                      <div key={i}>
                        <Label className="text-xs text-muted-foreground">{note.key}</Label>
                        {note.key === "情感表达方式" ? (
                          <Select value={note.value} onValueChange={(v) => updateNote(i, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择情感表达方式" />
                            </SelectTrigger>
                            <SelectContent>
                              {emotionOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={note.value}
                            onChange={(e) => updateNote(i, e.target.value)}
                            placeholder={`输入${note.key}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">选择一个角色开始编辑</h3>
              <p className="text-sm text-muted-foreground">从左侧列表中选择一个角色，或添加新角色</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}