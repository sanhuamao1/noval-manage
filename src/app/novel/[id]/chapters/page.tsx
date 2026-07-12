"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button, AddButton, NoBorderInput, SimpleTabs } from "@/components/ui";
import {
    Trash2,
    Save,
    FileText,
    CheckCircle2,
    Circle,
    ArrowUpDown,
    ArrowUpAZ,
    ArrowDownZA,
    ArrowUpNarrowWide,
    ArrowDownWideNarrow,
    Indent,
} from "lucide-react";
import { wordCount } from "@/lib/utils";
import { api } from "@/lib/api";
import { PolishProvider } from "@/components/polish/PolishContext";
import { ChapterEditor } from "@/components/chapters/ChapterEditor";
import { SelectionMenu } from "@/components/polish/SelectionMenu";
import { PolishResultPopover } from "@/components/polish/PolishResultPopover";
import { PolishPanel } from "@/components/polish/PolishPanel";

interface Chapter {
    id: string;
    title: string;
    content: string;
    status: string;
    relatedCharacters: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

type FilterTab = "all" | "published" | "draft";

const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "published", label: "定稿" },
    { key: "draft", label: "草稿" },
];

export default function ChaptersPage() {
    const params = useParams();
    const id = params.id as string;
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
        null,
    );
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [justCreated, setJustCreated] = useState(false);
    const [nameSort, setNameSort] = useState<"none" | "asc" | "desc">("none");
    const [timeSort, setTimeSort] = useState<"none" | "asc" | "desc">("none");

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchChapters();
    }, [id]);

    async function fetchChapters() {
        const data = await api<Chapter[]>({ url: `/api/chapters?novelId=${id}` });
        setChapters(data);
    }

    async function createChapter() {
        const newChapter = await api<Chapter>({
            url: "/api/chapters",
            method: "POST",
            data: { novelId: id, title: "未命名章节", content: "" },
        });
        setSelectedChapter(newChapter);
        setEditTitle(newChapter.title);
        setEditContent("");
        setJustCreated(true);
        fetchChapters();
    }

    async function deleteChapter(chapterId: string) {
        if (!confirm("确定要删除这个章节吗？")) return;
        await api({ url: `/api/chapters?id=${chapterId}`, method: "DELETE" });
        if (selectedChapter?.id === chapterId) setSelectedChapter(null);
        fetchChapters();
    }

    async function toggleStatus(chapter: Chapter) {
        const newStatus =
            chapter.status === "published" ? "draft" : "published";
        await api({
            url: "/api/chapters",
            method: "PUT",
            data: { id: chapter.id, novelId: id, status: newStatus },
        });
        if (selectedChapter?.id === chapter.id) {
            setSelectedChapter({ ...selectedChapter, status: newStatus });
        }
        fetchChapters();
    }

    function formatContent() {
        const lines = editContent.split("\n");
        const formatted = lines
            .map((l) => {
                const trimmed = l.replace(/\t/g, "    ").trimEnd();
                return trimmed && !/^\s/.test(trimmed) ? "    " + trimmed : trimmed;
            })
            .join("\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
        setEditContent(formatted);
    }

    const saveChapter = useCallback(async () => {
        if (!selectedChapter) return;
        setSaving(true);
        await api({
            url: "/api/chapters",
            method: "PUT",
            data: {
                id: selectedChapter.id,
                novelId: id,
                title: editTitle,
                content: editContent,
            },
        });
        setSaving(false);
        fetchChapters();
    }, [selectedChapter, editTitle, editContent]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                selectedChapter &&
                (editTitle !== selectedChapter.title ||
                    editContent !== selectedChapter.content)
            ) {
                saveChapter();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [editTitle, editContent, saveChapter, selectedChapter]);

    /** 新建章节后自动选中标题文本 */
    useEffect(() => {
        if (justCreated && titleInputRef.current) {
            titleInputRef.current.select();
            setJustCreated(false);
        }
    }, [justCreated]);

    function selectChapter(chapter: Chapter) {
        setSelectedChapter(chapter);
        setEditTitle(chapter.title);
        setEditContent(chapter.content);
    }

    const filteredChapters = chapters.filter((ch) => {
        if (filter === "all") return true;
        return ch.status === filter;
    });

    function cycleSort(
        current: "none" | "asc" | "desc",
    ): "none" | "asc" | "desc" {
        if (current === "none") return "asc";
        if (current === "asc") return "desc";
        return "none";
    }

    const sortedChapters = [...filteredChapters].sort((a, b) => {
        if (nameSort !== "none") {
            const cmp = a.title.localeCompare(b.title);
            return nameSort === "asc" ? cmp : -cmp;
        }
        if (timeSort !== "none") {
            const cmp =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
            return timeSort === "asc" ? cmp : -cmp;
        }
        return 0;
    });

    return (
        <PolishProvider
            editContent={editContent}
            setEditContent={setEditContent}
            editorRef={editorRef}
        >
            <div className="flex h-full">
                {/* 章节列表 */}
                <div className="w-72 border-r p-4 overflow-auto flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">章节列表</h2>
                        <AddButton onClick={createChapter} />
                    </div>

                    <SimpleTabs
                        tabs={filterTabs}
                        value={filter}
                        onChange={(k) => setFilter(k as FilterTab)}
                        counts={{
                            published: chapters.filter((ch) => ch.status === "published").length,
                            draft: chapters.filter((ch) => ch.status === "draft").length,
                        }}
                        className="mb-3"
                    />

                    {/* 排序栏 */}
                    <div className="flex items-center mb-2 px-1 text-xs text-muted-foreground">
                        <Button
                            variant="outline"
                            size="sm"
                            isActive={nameSort !== "none"}
                            onClick={() => {
                                setTimeSort("none");
                                setNameSort(cycleSort(nameSort));
                            }}
                        >
                            {nameSort === "none" ? (
                                <ArrowUpDown className="w-3 h-3" />
                            ) : nameSort === "asc" ? (
                                <ArrowUpAZ className="w-3 h-3" />
                            ) : (
                                <ArrowDownZA className="w-3 h-3" />
                            )}
                            名称
                        </Button>

                        <Button
                            variant="outline"
                            isActive={timeSort !== "none"}
                            size="sm"
                            onClick={() => {
                                setNameSort("none");
                                setTimeSort(cycleSort(timeSort));
                            }}
                        >
                            {timeSort === "none" ? (
                                <ArrowUpDown className="w-3 h-3" />
                            ) : timeSort === "asc" ? (
                                <ArrowUpNarrowWide className="w-3 h-3" />
                            ) : (
                                <ArrowDownWideNarrow className="w-3 h-3" />
                            )}
                            时间
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {sortedChapters.map((chapter, index) => (
                            <div
                                key={chapter.id}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                                    selectedChapter?.id === chapter.id
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-primary/10"
                                }`}
                                onClick={() => selectChapter(chapter)}
                            >
                                <span
                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                        chapter.status === "published"
                                            ? "bg-primary"
                                            : "border-2 border-muted-foreground bg-transparent"
                                    }`}
                                />
                                <span className="flex-1 truncate">
                                    {chapter.title || `未命名章节 ${index + 1}`}
                                </span>
                                <Button
                                    variant="destructive"
                                    size="auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteChapter(chapter.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        {filteredChapters.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {filter === "all"
                                    ? "还没有章节，点击上方按钮创建"
                                    : "没有符合条件的章节"}
                            </p>
                        )}
                    </div>
                </div>

                {/* 编辑器 */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    {selectedChapter ? (
                        <>
                            <div className="border-b p-4">
                                <div className="flex items-center gap-4">
                                    <NoBorderInput
                                        ref={titleInputRef}
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(e.target.value)
                                        }
                                        className="text-lg"
                                        placeholder="章节标题"
                                    />
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                                        <span className="mx-1 text-muted-foreground/30">
                                            |
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                toggleStatus(selectedChapter)
                                            }
                                            className={`${selectedChapter.status === "published" ? "text-green-500" : "text-amber-500"}`}
                                        >
                                            {selectedChapter.status ===
                                            "published" ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    已定稿
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="w-3 h-3 mr-1" />
                                                    草稿
                                                </>
                                            )}
                                        </Button>
                                        <span>{wordCount(editContent)} 字</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={formatContent}
                                            title="格式化缩进"
                                        >
                                            <Indent className="w-4 h-4 mr-1" />
                                            格式化
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={saveChapter}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-1" />
                                            {saving ? "保存中..." : "保存"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-4 relative">
                                <ChapterEditor
                                    editContent={editContent}
                                    setEditContent={setEditContent}
                                    editorRef={editorRef}
                                />
                                <SelectionMenu />
                                <PolishResultPopover />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    选择一个章节开始编辑
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    从左侧列表中选择一个章节，或创建新章节
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <PolishPanel />
            </div>
        </PolishProvider>
    );
}
