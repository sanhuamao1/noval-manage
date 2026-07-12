import type { PolishRuleConfig, PolishSampleConfig } from "@/lib/configs/generated";

/** API 返回的润色规则数据 = 可编辑配置 + 系统字段 */
export interface PolishRule extends Omit<PolishRuleConfig, "description"> {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** API 返回的润色样本数据 = 可编辑配置 + 系统字段 */
export interface PolishSample extends Omit<PolishSampleConfig, "prompt"> {
  id: string;
  name: string;
  prompt: string;
  useCount: number;
  createdAt?: string;
  updatedAt?: string;
}
