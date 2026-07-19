"use client";

import { useMemo } from "react";
import {
  getBezierPath,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from "reactflow";
import { getEdgeParams } from "./floating-edges-utils";

const nodesSelector = (state: ReactFlowState) => state.nodeInternals;

/**
 * 浮动边组件：根据源/目标节点实际位置动态计算连线端点，始终吸附在节点最近边缘。
 */
export default function FloatingEdge({
  id,
  source,
  target,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) {
  const nodeInternals = useStore(nodesSelector);

  const sourceNode = nodeInternals.get(source);
  const targetNode = nodeInternals.get(target);

  const { d, labelX, labelY } = useMemo(() => {
    if (!sourceNode || !targetNode) return { d: "", labelX: 0, labelY: 0 };

    const s = {
      width: (sourceNode as any).width ?? (sourceNode as any).measured?.width ?? 80,
      height: (sourceNode as any).height ?? (sourceNode as any).measured?.height ?? 32,
      position: sourceNode.position,
    };
    const t = {
      width: (targetNode as any).width ?? (targetNode as any).measured?.width ?? 80,
      height: (targetNode as any).height ?? (targetNode as any).measured?.height ?? 32,
      position: targetNode.position,
    };

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(s, t);

    const [path, lx, ly] = getBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetX: tx,
      targetY: ty,
      targetPosition: targetPos,
    });
    return { d: path, labelX: lx, labelY: ly };
  }, [sourceNode, targetNode]);

  if (!d) return null;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={d}
        style={style}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute"
            style={{
              ...labelStyle,
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              fontSize: 11,
            }}
          >
            <span
              style={{
                ...labelBgStyle,
                padding: `${labelBgPadding?.[1] ?? 2}px ${labelBgPadding?.[0] ?? 4}px`,
                borderRadius: labelBgBorderRadius ?? 2,
              }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
