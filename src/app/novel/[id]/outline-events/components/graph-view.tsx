"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
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
import { useEntitySWR } from "@/hooks/useEntitySWR";
import { buildEntityKey } from "@/lib/swr-fetcher";
import { mutate } from "swr";
import { api } from "@/lib/api";
import { getEventTypeStyle, getConnectionTypeStyle } from "@/lib/event-utils";
import type { EventNodeData, EventConnectionData } from "@/types/event-data";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const debounce = (fn: Function, ms: number) => { let timer: any; return (...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };
import {
  Star, Users, MapPin, Clock, Plus,
} from "lucide-react";

const NODE_W = 100;
const GRID_GAP = 200;
const COLS = 4;

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

interface EventNodeDataCustom {
  label: string;
  eventType: string | null | undefined;
  importance: number;
  storyTime: string | null | undefined;
  characterIds: string[];
  locationIds: string[];
  charNames: string[];
  locNames: string[];
  collapsed: boolean;
}

type EventFlowNode = Node<EventNodeDataCustom>;

function computeGridPosition(index: number): { x: number; y: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return { x: col * GRID_GAP + 40, y: row * 100 + 40 };
}

const HANDLE_CLASS = "!h-2.5 !w-2.5 !border-2 !border-bg-700 !bg-bg-500";

// ── Custom Node ──

function EventFlowNodeComponent({ data }: NodeProps<EventNodeDataCustom>) {
  const typeStyle = getEventTypeStyle(data.eventType);
  const importance = data.importance ?? 1;

  const [expanded, setExpanded] = useState(!data.collapsed);

  return (
    <div
      className="rounded-lg border shadow-md transition-shadow hover:shadow-lg"
      style={{
        borderColor: typeStyle.hex,
        minWidth: NODE_W,
        background: `${typeStyle.hex}12`,
        borderLeft: `3px solid ${typeStyle.hex}`,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setExpanded(!expanded);
      }}
    >
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />

      <div className="px-3 py-2">
        {/* Title row */}
        <div className="flex items-center gap-1.5">
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${typeStyle.bg}`}>
            {data.eventType ? data.eventType.charAt(0) : "?"}
          </div>
          <span className="truncate text-xs font-medium text-fg-primary">{data.label}</span>
        </div>

        {/* Importance stars */}
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-2.5 h-2.5 ${
                star <= importance
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-1.5 space-y-1 border-t border-border-subtle pt-1.5">
            {data.charNames.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-fg-tertiary">
                <Users className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{data.charNames.slice(0, 3).join("、")}</span>
              </div>
            )}
            {data.storyTime && (
              <div className="flex items-center gap-1 text-[10px] text-fg-tertiary">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{data.storyTime}</span>
              </div>
            )}
            {data.locNames.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-fg-tertiary">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{data.locNames.slice(0, 2).join("、")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { eventNode: EventFlowNodeComponent };

// ── Graph View ──

interface GraphViewProps {
  onEventDoubleClick?: (event: any) => void;
  onAddEvent?: () => void;
}

export default function GraphView({ onEventDoubleClick, onAddEvent }: GraphViewProps) {
  const params = useParams();
  const novelId = params.id as string;

  const { data: events = [] } = useEntitySWR<EventNodeData[]>("eventNodes", novelId);
  const { data: connections = [] } = useEntitySWR<EventConnectionData[]>("eventConnections", novelId);
  const { data: characters = [] } = useEntitySWR<{ id: string; name: string }[]>("characters", novelId);
  const { data: locations = [] } = useEntitySWR<{ id: string; name: string }[]>("locations", novelId);

  const charMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of characters) m[c.id] = c.name;
    return m;
  }, [characters]);

  const locMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const l of locations) m[l.id] = l.name;
    return m;
  }, [locations]);

  // Build nodes
  const initialNodes: EventFlowNode[] = useMemo(() => {
    return events.map((event, i) => {
      const charIds: string[] = event.characterIds ?? [];
      const locIds: string[] = event.locationIds ?? [];
      return {
        id: event.id,
        type: "eventNode",
        position: computeGridPosition(i),
        data: {
          label: event.title || "未命名事件",
          eventType: event.eventType,
          importance: event.importance ?? 1,
          storyTime: event.storyTime,
          characterIds: charIds,
          locationIds: locIds,
          charNames: charIds.map((id) => charMap[id]).filter(Boolean),
          locNames: locIds.map((id) => locMap[id]).filter(Boolean),
          collapsed: false,
        },
      };
    });
  }, [events, charMap, locMap]);

  // Build edges
  const initialEdges: Edge[] = useMemo(() => {
    return connections.map((conn) => {
      const connStyle = getConnectionTypeStyle(conn.type);
      return {
        id: conn.id,
        source: conn.sourceId,
        target: conn.targetId,
        label: conn.type,
        type: "smoothstep",
        style: { ...EDGE_STYLE, stroke: connStyle.color },
        labelStyle: { ...EDGE_LABEL_STYLE, fill: connStyle.color },
        labelBgStyle: EDGE_LABEL_BG_STYLE,
        labelBgPadding: EDGE_LABEL_BG_PADDING,
        labelBgBorderRadius: EDGE_LABEL_BG_RADIUS,
        markerEnd: { ...EDGE_MARKER, color: connStyle.color },
        animated: true,
      };
    });
  }, [connections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const eventIds = useMemo(() => new Set(events.map((e) => e.id)), [events]);

  // Sync nodes when events change
  useEffect(() => {
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      return events.map((event, i) => {
        const prevNode = prevMap.get(event.id);
        const charIds: string[] = event.characterIds ?? [];
        const locIds: string[] = event.locationIds ?? [];
        return {
          id: event.id,
          type: "eventNode",
          position: prevNode?.position ?? computeGridPosition(i),
          data: {
            label: event.title || "未命名事件",
            eventType: event.eventType,
            importance: event.importance ?? 1,
            storyTime: event.storyTime,
            characterIds: charIds,
            locationIds: locIds,
            charNames: charIds.map((id) => charMap[id]).filter(Boolean),
            locNames: locIds.map((id) => locMap[id]).filter(Boolean),
            collapsed: prevNode?.data?.collapsed ?? false,
          },
        };
      });
    });
  }, [events, charMap, locMap, setNodes]);

  // Sync edges when connections change
  useEffect(() => {
    setEdges(
      connections.map((conn) => {
        const connStyle = getConnectionTypeStyle(conn.type);
        return {
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          label: conn.type,
          type: "smoothstep",
          style: { ...EDGE_STYLE, stroke: connStyle.color },
          labelStyle: { ...EDGE_LABEL_STYLE, fill: connStyle.color },
          labelBgStyle: EDGE_LABEL_BG_STYLE,
          labelBgPadding: EDGE_LABEL_BG_PADDING,
          labelBgBorderRadius: EDGE_LABEL_BG_RADIUS,
          markerEnd: { ...EDGE_MARKER, color: connStyle.color },
          animated: true,
        };
      }),
    );
  }, [connections, setEdges]);

  // Validate connections
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return false;
      if (!eventIds.has(source) || !eventIds.has(target)) return false;
      if (connections.some((c) => c.sourceId === source && c.targetId === target)) return false;
      return true;
    },
    [eventIds, connections],
  );

  // On connect
  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      api({
        url: "/api/event-connections",
        method: "POST",
        data: { novelId, sourceId: source, targetId: target, type: "导致", strength: 1 },
      }).then(() => mutate(buildEntityKey("eventConnections", novelId)))
        .catch((err) => console.error("创建连接失败:", err));
    },
    [novelId, mutate],
  );

  // Delete edge on right-click
  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      api({
        url: `/api/event-connections?id=${edge.id}`,
        method: "DELETE",
      }).then(() => mutate(buildEntityKey("eventConnections", novelId)))
        .catch((err) => console.error("删除连接失败:", err));
    },
    [novelId, mutate],
  );

  // Node double-click
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<EventNodeDataCustom>) => {
      const event = events.find((e) => e.id === node.id);
      if (event && onEventDoubleClick) {
        onEventDoubleClick(event);
      }
    },
    [events, onEventDoubleClick],
  );

  // Save position debounced
  const debouncedSavePositions = useMemo(
    () =>
      debounce((_currentNodes: EventFlowNode[]) => {
        // Positions are stored in memory for now
      }, 500),
    [],
  );

  const handleNodeDragStop = useCallback(() => {
    debouncedSavePositions(nodesRef.current);
  }, [debouncedSavePositions]);

  // Right-click on pane to add event
  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onAddEvent?.();
    },
    [onAddEvent],
  );

  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        暂无事件，点击右上角添加
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
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodeDragStop={handleNodeDragStop}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={(e) => e.preventDefault()}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={CONNECTION_LINE_STYLE}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        zoomOnDoubleClick={false}
        panOnScroll
        className="!bg-bg-950"
      >
        <Background color="#27272a" gap={20} size={1} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-bg-600 bg-bg-900/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-4">
          {["关键剧情", "日常", "转折", "战斗", "感情", "伏笔揭示"].map((type) => {
            const style = getEventTypeStyle(type);
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: style.hex }}
                />
                <span className="text-xs text-fg-secondary">{type}</span>
              </div>
            );
          })}
        </div>
        <span className="text-xs text-fg-tertiary">
          拖拽节点移动 · 从节点右侧拉线创建连接 · 右键连线删除 · 双击节点编辑
        </span>
      </div>
    </div>
  );
}
