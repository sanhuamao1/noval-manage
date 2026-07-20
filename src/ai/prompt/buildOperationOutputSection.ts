import { OPERATION_ENTITIES } from "../validators";
import { OPERATIONS_OUTPUT_TEMPLATE } from "./templates/operations-output";

/** 组装完整的 Operations 输出格式 Prompt */
export default function buildOperationOutputSection(novelId: string): string {
  const apiRows = Object.entries(OPERATION_ENTITIES)
    .map(([api, entry]) => `| ${entry.label} | ${api} |`)
    .join("\n");

  return OPERATIONS_OUTPUT_TEMPLATE
    .replaceAll("{{novelId}}", novelId)
    .replace("{{apiRows}}", apiRows);
}