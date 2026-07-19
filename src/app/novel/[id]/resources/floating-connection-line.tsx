"use client";

import { getBezierPath, type ConnectionLineComponentProps } from "reactflow";
import { getEdgeParams } from "./floating-edges-utils";

/**
 * 浮动连接线：拖动连线时的预览效果，端点动态计算
 */
export default function FloatingConnectionLine({
  toX,
  toY,
  fromNode,
}: ConnectionLineComponentProps) {
  if (!fromNode) return null;

  const sourceNode = {
    width: (fromNode as any).width ?? 80,
    height: (fromNode as any).height ?? 32,
    position: fromNode.position,
  };
  const targetNode = {
    width: 1,
    height: 1,
    position: { x: toX, y: toY },
  };

  const { sx, sy, sourcePos } = getEdgeParams(sourceNode, targetNode);

  const [d] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: toX,
    targetY: toY,
    targetPosition: sourcePos, // 使用与 source 相同的 position 避免连线扭曲
  });

  return (
    <g>
      <path fill="none" stroke="#a1a1aa" strokeWidth={1.5} d={d} />
      <circle cx={toX} cy={toY} fill="#18181b" r={3} stroke="#a1a1aa" strokeWidth={1.5} />
    </g>
  );
}
