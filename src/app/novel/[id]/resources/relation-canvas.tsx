"use client";

import { useMemo, useRef, useCallback, useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import ReactFlow, {
  Handle,
  Position,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  type NodeProps,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { useNovelStore } from "@/stores/useNovelStore";
import { useEntityStore } from "@/stores/useEntityStore";
import { api } from "@/lib/api";
import type { RelationData, NodePosition } from "@/types/data";
import { debounce } from "lodash-es";
import FloatingEdge from "./floating-edge";
import FloatingConnectionLine from "./floating-connection-line";

const edgeTypes = { floating: FloatingEdge };

// ── 常量 ──
const ROLE_COLORS: Record<string, string> = {
  主角: "#e4a76e",
  配角: "#9a9080",
  反派: "#c76060",
};

const NODE_W = 80;
const GRID_GAP = 180;
const COLS = 5;

const EDGE_STYLE = { stroke: "#52525b", strokeWidth: 1.5 };
const EDGE_LABEL_STYLE = { fill: "#a1a1aa", fontSize: 11, cursor: "pointer" };
const EDGE_LABEL_BG_STYLE = { fill: "#18181b", fillOpacity: 0.85 };
const EDGE_LABEL_BG_PADDING: [number, number] = [6, 3];
const EDGE_LABEL_BG_RADIUS = 4;
const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: "#52525b",
  width: 12,
  height: 12,
};
const CONNECTION_LINE_STYLE = { stroke: "#a1a1aa", strokeWidth: 1.5 };

type Role = "主角" | "配角" | "反派" | string;

interface CharacterNodeData {
  name: string;
  role: Role;
}

type CharacterNode = Node<CharacterNodeData>;

function computeGridPosition(index: number): { x: number; y: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return { x: col * GRID_GAP + 40, y: row * 70 + 40 };
}

// ── Handle 样式 ──
const HANDLE_CLASS = "!h-2 !w-2 !border-2 !border-bg-700 !bg-bg-500" as const;

// ── 自定义节点 ──
const CharacterNode = memo(function CharacterNode({ data }: NodeProps<CharacterNodeData>) {
  const color = ROLE_COLORS[data.role] ?? "#9a9080";

  return (
    <div
      className="flex items-center justify-center rounded-md border px-3 py-2.5 text-xs font-medium shadow-md transition-shadow hover:shadow-lg"
      style={{
        borderColor: color,
        background: `${color}18`,
        minWidth: NODE_W,
      }}
    >
      <Handle type="source" position={Position.Top} className={HANDLE_CLASS} />
      <span className="truncate text-fg-primary">{data.name}</span>
    </div>
  );
});

const nodeTypes = { character: CharacterNode };

// ── 自定义 Hooks ──

/** 同步节点 */
function useSyncNodes(
  characters: { id: string; name: string; role?: string }[],
  positions: Record<string, NodePosition>,
  setNodes: ReturnType<typeof useNodesState<CharacterNodeData>>[1]
) {
  useEffect(() => {
    setNodes((prev) => {
      const existingMap = new Map(prev.map((n) => [n.id, n.position]));
      return characters.map((c, i) => {
        const pos = existingMap.get(c.id) ?? positions[c.id] ?? computeGridPosition(i);
        return {
          id: c.id,
          type: "character",
          position: pos,
          data: { name: c.name, role: c.role ?? "" },
        };
      });
    });
  }, [characters, positions, setNodes]);
}

/** 同步边：浮动边模式，端点由 FloatingEdge 组件根据节点位置动态计算 */
function useSyncEdges(
  links: RelationData[] | undefined,
  setEdges: ReturnType<typeof useEdgesState>[1]
) {
  useEffect(() => {
    const relationsArray = links || [];

    const newEdges = relationsArray.map((r) => ({
      id: `${r.source}->${r.target}`,
      source: r.source,
      target: r.target,
      label: r.description,
      type: "floating" as const,
      style: EDGE_STYLE,
      labelStyle: EDGE_LABEL_STYLE,
      labelBgStyle: EDGE_LABEL_BG_STYLE,
      labelBgPadding: EDGE_LABEL_BG_PADDING,
      labelBgBorderRadius: EDGE_LABEL_BG_RADIUS,
      markerEnd: EDGE_MARKER,
      interactionWidth: 50,
    }));
    setEdges(newEdges);
  }, [links, setEdges]);
}

/** 防抖保存节点位置（使用 store 的 mutate） */
function useDebouncedSavePositions(
  novelId: string,
  nodesRef: React.RefObject<CharacterNode[]>,
) {
  // 用 ref 存储 novelId，避免 debounce 内部闭包过期
  const novelIdRef = useRef(novelId);
  novelIdRef.current = novelId;

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        const currentNodes = nodesRef.current;
        if (!currentNodes?.length) return;
        const newPositions: Record<string, NodePosition> = {};
        for (const n of currentNodes) {
          newPositions[n.id] = { x: n.position.x, y: n.position.y };
        }
        useNovelStore
          .getState()
          .mutate(novelIdRef.current, "relations", () =>
            api({
              url: "/api/relations",
              method: "PUT",
              data: { novelId: novelIdRef.current, positions: newPositions },
            }),
          )
          .catch((err) => {
            console.error("保存位置失败:", err);
          });
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return debouncedSave;
}

// ── 主组件 ──
interface RelationCanvasProps {
  onEditCharacter?: (item: { id: string; name: string; [k: string]: any }) => void;
}

export default function RelationCanvas({ onEditCharacter }: RelationCanvasProps) {
  const params = useParams();
  const novelId = params.id as string;

  // 从 store 获取数据
  const characters = useEntityStore((s) => s.characters);
  const relationsFromStore = useEntityStore((s) => s.relations); // RelationsData: { links, positions }
  const mutate = useNovelStore((s) => s.mutate);

  const links = relationsFromStore.links;
  const positions = relationsFromStore.positions;

  const [nodes, setNodes, onNodesChange] = useNodesState<CharacterNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes as CharacterNode[];

  const nodeIdsRef = useRef(new Set<string>());
  useEffect(() => {
    nodeIdsRef.current = new Set(characters.map((c) => c.id));
  }, [characters]);

  // 同步节点
  useSyncNodes(characters, positions, setNodes);
  // 同步边：传入 links 和 nodes 以根据位置智能选择 handle
  useSyncEdges(links, setEdges);

  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const savePositionsDebounced = useDebouncedSavePositions(novelId, nodesRef);

  // 连接校验
  const isValidConnection = useCallback((connection: Connection) => {
    const { source, target } = connection;
    if (!source || !target || source === target) return false;
    if (!nodeIdsRef.current.has(source) || !nodeIdsRef.current.has(target)) return false;
    if (edgesRef.current.some((e) => e.id === `${source}->${target}`)) return false;
    return true;
  }, []);

  // ── 连线处理（只更新 store 中的 relations） ──
  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const newRelation: RelationData = { source, target, description: "" };
      // 使用 links（即当前的 relations 数组）
      const updated = [...(links || []), newRelation];

      // 更新 store 的 relations 字段
      mutate(novelId, "relations", () =>
        api({ url: "/api/relations", method: "POST", data: { novelId, relations: updated } })
      ).catch((err) => {
        console.error("保存关系失败:", err);
      });
    },
    [novelId, links]
  );

  // ── 删除连线（右键触发，阻止默认菜单） ──
  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const edgeId = edge.id;
      const updated = (links || []).filter((r) => `${r.source}->${r.target}` !== edgeId);
      mutate(novelId, "relations", () =>
        api({ url: "/api/relations", method: "POST", data: { novelId, relations: updated } })
      ).catch((err) => {
        console.error("删除关系失败:", err);
      });
    },
    [novelId, links]
  );

  // ── 编辑连线描述（双击触发） ──
  const [editingEdge, setEditingEdge] = useState<{
    id: string;
    label: string;
    x: number;
    y: number;
  } | null>(null);

  // 点击外部关闭编辑框
  useEffect(() => {
    if (!editingEdge) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const popup = document.getElementById("edge-edit-popup");
      if (popup && popup.contains(target)) return;
      setEditingEdge(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [editingEdge]);

  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEditingEdge({
        id: edge.id,
        label: (edge.label as string) ?? "",
        x: _event.clientX,
        y: _event.clientY,
      });
    },
    []
  );

  const saveLabel = useCallback(() => {
    if (!editingEdge) return;
    const { id, label } = editingEdge;

    const updated = (links || []).map((r) =>
      `${r.source}->${r.target}` === id ? { ...r, description: label } : r
    );

    mutate(novelId, "relations", () =>
      api({ url: "/api/relations", method: "POST", data: { novelId, relations: updated } })
    ).catch((err) => {
      console.error("更新关系描述失败:", err);
    });

    setEditingEdge(null);
  }, [editingEdge, novelId, links]);

  const cancelEdit = useCallback(() => {
    setEditingEdge(null);
  }, []);

  // ── 拖拽结束 ──
  const handleNodeDragStop = useCallback(() => {
    savePositionsDebounced();
  }, [savePositionsDebounced]);

  // ── 双击节点编辑 ──
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<CharacterNodeData>) => {
      const char = characters.find((c) => c.id === node.id);
      if (char && onEditCharacter) {
        onEditCharacter(char);
      }
    },
    [characters, onEditCharacter]
  );

  // ── 图例 ──
  const roleList = useMemo(() => {
    const seen = new Set<string>();
    const list: { role: string; color: string }[] = [];
    for (const c of characters) {
      const r = c.role ?? "";
      if (r && !seen.has(r)) {
        seen.add(r);
        list.push({ role: r, color: ROLE_COLORS[r] ?? "#9a9080" });
      }
    }
    return list;
  }, [characters]);

  if (characters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-fg-tertiary text-sm">
        还没有人物，请先添加角色
      </div>
    );
  }

  return (
    <div className="relative h-full w-full select-none bg-bg-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodeDragStop={handleNodeDragStop}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={CONNECTION_LINE_STYLE}
        onPaneContextMenu={(e) => e.preventDefault()}
        onNodeContextMenu={(e) => e.preventDefault()}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        className="!bg-bg-950"
      >
        <Background color="#27272a" gap={20} size={1} />
      </ReactFlow>

      {editingEdge && (
        <div
          id="edge-edit-popup"
          className="fixed z-50 flex items-center gap-2 rounded-lg border border-bg-500 bg-bg-800 px-3 py-2 shadow-xl"
          style={{ left: editingEdge.x + 12, top: editingEdge.y - 20 }}
        >
          <input
            autoFocus
            value={editingEdge.label}
            onChange={(e) =>
              setEditingEdge((prev) => (prev ? { ...prev, label: e.target.value } : null))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLabel();
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-36 rounded border border-bg-500 bg-bg-700 px-2 py-1 text-xs text-fg-primary outline-none focus:border-blue-500"
            placeholder="关系描述..."
          />
          <button
            onClick={saveLabel}
            className="whitespace-nowrap text-xs text-blue-400 transition hover:text-blue-300"
          >
            保存
          </button>
          <button
            onClick={cancelEdit}
            className="whitespace-nowrap text-xs text-fg-tertiary transition hover:text-fg-secondary"
          >
            取消
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-bg-600 bg-bg-900/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-4">
          {roleList.map((item) => (
            <div key={item.role} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-xs text-fg-secondary">{item.role}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-fg-tertiary">双击连线编辑描述 · 右键连线删除 · 滚轮缩放 · 拖拽平移 · 拖拽节点调整位置</span>
      </div>
    </div>
  );
}