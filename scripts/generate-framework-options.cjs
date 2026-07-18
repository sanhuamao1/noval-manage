// scripts/generate-framework-options.cjs
// 扫描 configs/frameworks/*.md → 生成 shared-options.yml 中的 outline-framework 选项
// 在 generate-configs.cjs 之前执行，确保选项数据已更新

const { readFileSync, writeFileSync, readdirSync } = require("fs");
const { resolve } = require("path");
const yaml = require("js-yaml");

const ROOT = resolve(__dirname, "..");
const FRAMEWORKS_DIR = resolve(ROOT, "configs/frameworks");
const SHARED_OPTIONS_PATH = resolve(ROOT, "configs/shared-options.yml");

/** 解析 MD 文件的 front matter（YAML 格式） */
function parseFrontMatter(content) {
  if (!content.startsWith("---")) return { data: {}, body: content };

  const end = content.indexOf("---", 3);
  if (end === -1) return { data: {}, body: content };

  const yml = content.slice(3, end);
  const body = content.slice(end + 3).trim();
  const data = yaml.load(yml) ?? {};
  return { data, body };
}

/** 扫描 frameworks 目录，返回选项数组 */
function scanFrameworks() {
  if (!require("fs").existsSync(FRAMEWORKS_DIR)) {
    console.warn(`目录不存在: ${FRAMEWORKS_DIR}，跳过框架选项生成`);
    return [];
  }

  const files = readdirSync(FRAMEWORKS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const raw = readFileSync(resolve(FRAMEWORKS_DIR, file), "utf-8");
    const { data } = parseFrontMatter(raw);
    const value = file.replace(/\.md$/, "");
    return {
      value,
      icon: data.icon || "FileText",
      label: data.label, // 可选，默认显示 value
    };
  });
}

/** 更新 shared-options.yml 中的 outline-framework 选项 */
function updateSharedOptions(frameworks) {
  const raw = readFileSync(SHARED_OPTIONS_PATH, "utf-8");

  // 使用 yaml 加载整个文档
  const doc = yaml.load(raw) ?? {};

  // 更新 outline-framework 选项
  doc["outline-framework"] = frameworks;

  // 转回 YAML 并保留原始格式
  const lines = [];
  let handledFramework = false;

  // 直接操作 YAML dump 结果，保持简洁格式
  const frameworkYml = yaml.dump({ "outline-framework": frameworks }, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
    noCompatMode: true,
    flowLevel: -1,
  });

  // 查找并替换 outline-framework 部分，或追加
  const frameworkHeader = "outline-framework:";
  if (raw.includes(frameworkHeader)) {
    // 已有的 outline-framework 节，替换它
    const startIdx = raw.indexOf(frameworkHeader);
    // 找到这个 section 的结束位置（下一个顶级 key 或文件尾）
    const afterSection = raw.slice(startIdx + frameworkHeader.length);
    const nextKeyMatch = afterSection.match(/\n\w[\w-]*:/);
    let endIdx;
    if (nextKeyMatch) {
      endIdx = startIdx + frameworkHeader.length + nextKeyMatch.index;
    } else {
      endIdx = raw.length;
    }
    const before = raw.slice(0, startIdx);
    const after = raw.slice(endIdx);
    const newContent = yaml.dump({ "outline-framework": frameworks }, {
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: false,
      noCompatMode: true,
      flowLevel: -1,
    });
    writeFileSync(SHARED_OPTIONS_PATH, before + newContent.trim() + "\n" + after.trimStart(), "utf-8");
  } else {
    // 新增 outline-framework 节，追加到文件末尾
    writeFileSync(SHARED_OPTIONS_PATH, raw.trimEnd() + "\n\n" + frameworkYml.trim() + "\n", "utf-8");
  }

  console.log(`Updated shared-options.yml with ${frameworks.length} framework options`);
}

// ── 执行 ──
const frameworks = scanFrameworks();
if (frameworks.length > 0) {
  updateSharedOptions(frameworks);
  console.log(`Frameworks: ${frameworks.map((f) => f.value).join(", ")}`);
} else {
  console.log("No framework MD files found, shared-options.yml unchanged");
}
