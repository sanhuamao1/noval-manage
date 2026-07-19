/** 从 AI 响应文本中提取 JSON 对象（处理 markdown 代码围栏包裹，支持截断恢复） */
export function extractJSON(text: string): string {
  // 尝试去掉 markdown 代码围栏 ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // 尝试找到第一个 { 到最后一个 }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  // 被截断的情况：尝试找到 operations 数组末尾并闭合
  const opsEnd = text.lastIndexOf('"operations"');
  if (opsEnd !== -1) {
    let truncated = text.slice(start);
    truncated = closePartialJSON(truncated);
    return truncated;
  }

  return text.trim();
}

/** 尝试闭合被截断的 JSON：回退到最后一个完整元素，补全缺失的括号 */
export function closePartialJSON(json: string): string {
  // 回退到最后一个完整的逗号位置（保证前一个元素是完整的）
  const lastComma = Math.max(
    json.lastIndexOf(",\n"),
    json.lastIndexOf(",\r"),
    json.lastIndexOf(",\t"),
    json.lastIndexOf(", "),
  );
  if (lastComma > 0) {
    json = json.slice(0, lastComma);
  }

  // 计数未闭合的括号（区分 { } 和 [ ]）
  const stack: string[] = [];
  let inString = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    const prev = i > 0 ? json[i - 1] : "";

    if (ch === '"' && prev !== "\\") {
      inString = !inString;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}") {
      if (stack[stack.length - 1] === "{") stack.pop();
    } else if (ch === "]") {
      if (stack[stack.length - 1] === "[") stack.pop();
    }
  }

  // 按逆序闭合
  for (let i = stack.length - 1; i >= 0; i--) {
    json += stack[i] === "{" ? "}" : "]";
  }

  return json;
}