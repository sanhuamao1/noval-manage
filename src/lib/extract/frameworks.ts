// src/lib/extract/frameworks.ts
// 服务端按需读取框架 MD 正文内容

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const FRAMEWORKS_DIR = path.join(process.cwd(), "configs", "frameworks");

export interface FrameworkMeta {
  icon?: string;
  label?: string;
}

export interface FrameworkInfo {
  value: string;
  icon?: string;
  label?: string;
  content: string;
}

/** 解析 MD 文件的 front matter */
function parseFrontMatter(content: string): { data: FrameworkMeta; body: string } {
  if (!content.startsWith("---")) return { data: {}, body: content };

  const end = content.indexOf("---", 3);
  if (end === -1) return { data: {}, body: content };

  const yml = content.slice(3, end);
  const body = content.slice(end + 3).trim();
  const data = (yaml.load(yml) as FrameworkMeta) ?? {};
  return { data, body };
}

/**
 * 根据框架名称获取 MD 正文内容（不含 front matter）
 */
export function getFrameworkContent(frameworkValue: string): string | null {
  const filePath = path.join(FRAMEWORKS_DIR, `${frameworkValue}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`框架文件不存在: ${filePath}`);
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { body } = parseFrontMatter(raw);
  return body || null;
}

/**
 * 获取框架完整信息（元数据 + 正文）
 */
export function getFramework(frameworkValue: string): FrameworkInfo | null {
  const filePath = path.join(FRAMEWORKS_DIR, `${frameworkValue}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`框架文件不存在: ${filePath}`);
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, body } = parseFrontMatter(raw);
  return {
    value: frameworkValue,
    icon: data.icon,
    label: data.label,
    content: body,
  };
}

/**
 * 获取所有可用框架的列表（仅元数据，不含正文）
 */
export function listFrameworks(): Omit<FrameworkInfo, "content">[] {
  if (!fs.existsSync(FRAMEWORKS_DIR)) return [];

  return fs
    .readdirSync(FRAMEWORKS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(FRAMEWORKS_DIR, file), "utf-8");
      const { data } = parseFrontMatter(raw);
      return {
        value: file.replace(/\.md$/, ""),
        icon: data.icon,
        label: data.label,
      };
    });
}
