import { Position } from "reactflow";

interface NodeBoundingBox {
  width: number;
  height: number;
  position: { x: number; y: number };
}

/**
 * 计算 intersectionNode 与 targetNode 的中心连线与 intersectionNode 边界的交点
 */
function getNodeIntersection(intersectionNode: NodeBoundingBox, targetNode: NodeBoundingBox) {
  const { width, height, position: intersectionPosition } = intersectionNode;
  const targetPosition = targetNode.position;

  const w = width / 2;
  const h = height / 2;

  const x2 = intersectionPosition.x + w;
  const y2 = intersectionPosition.y + h;
  const x1 = targetPosition.x + targetNode.width / 2;
  const y1 = targetPosition.y + targetNode.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

/**
 * 根据交点在节点上的位置判断边应连接的方位
 */
function getEdgePosition(node: NodeBoundingBox, intersectionPoint: { x: number; y: number }): Position {
  const nx = Math.round(node.position.x);
  const ny = Math.round(node.position.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) return Position.Left;
  if (px >= nx + node.width - 1) return Position.Right;
  if (py <= ny + 1) return Position.Top;
  if (py >= ny + node.height - 1) return Position.Bottom;

  return Position.Top;
}

/**
 * 获取绘制浮动边所需的全部参数
 */
export function getEdgeParams(source: NodeBoundingBox, target: NodeBoundingBox) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersection);
  const targetPos = getEdgePosition(target, targetIntersection);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos,
    targetPos,
  };
}
