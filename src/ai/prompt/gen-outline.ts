import { formatNovelSection } from "../context/novel";
import {
  formatCharactersSection,
  formatOrganizationsSection,
  formatLocationsSection,
} from "../context/entities";
import { formatRelationsSection } from "../context/relations";

/** 中段情节生成规则 — 五维随机变量抽取 */
function buildRandomizationRules(): string {
  return `**【中段情节生成规则 —— 变量抽取区】**

> 在生成中段大纲之前，请你先执行一次"随机抽取"，从以下五个维度各选一项。抽取结果将决定本轮中段情节的独特风味。

**维度一：主要阻力源（抽2-3个，不重复）**
- A. 天灾型（极端气候、地质灾害、瘟疫等自然力量）
- B. 人祸型（当地掌权者/地头蛇的刁难，非主线反派，纯利益冲突）
- C. 内部动摇型（团队内部因旧日秘密、信任危机、背叛疑云而瘫痪）
- D. 规则型（当地奇特的宗教禁忌/法律条文/社会习俗，强行制造困境）
- E. 误会型（第三方势力将主角误认为另一伙人，展开追击或设伏）
- F. 资源匮乏型（必须消耗不可再生的关键道具/能力/关系来交换通行）
- G. 信息误导型（获得的关键情报是半真半假的诱饵，导向错误方向）
- H. 精神侵蚀型（主角受到幻象、心魔等精神攻击，辨不清敌友）

**维度二：关键场景的舞台（为中段3场重头戏各抽1个）**
- A. 正在坍塌/爆炸的密闭空间（遗迹、矿井、飞船、大楼）
- B. 万众瞩目的公共场合（庆典、法庭、直播现场、竞技场）——必须维持表面和平
- C. 物理规则失效的异空间（梦境、精神世界、虚拟空间、时间流速异常区）
- D. 敌方核心区域的非战斗地带（厨房/医务室/档案室/停尸房）
- E. 中立地带的灰色场所（黑市、赌场、难民营、无人区驿站）
- F. 移动中的载具上（列车、马车、飞行器、航行中的船只）
- G. 极端自然环境（深海、火山口、雷暴区、流沙带）
- H. 日常/温馨场所的异常时刻（主角自己家中、常去的餐馆、教室）——当危险入侵日常

**维度三：中间情报的揭露顺序（抽1种）**
- A. 先知道"为什么"（动机）→ 再追查"怎么做到的"（手法）→ 最后锁定"是谁"（元凶）
- B. 先锁定"是谁"（表面元凶浮现）→ 再推翻重查 → 最后追问"真正的为什么"
- C. 先拿到确凿物证 → 但物证指向的人已死/失踪 → 通过追查此人生前轨迹反向推导
- D. 先收到匿名警告/提示 → 逐条验证真伪 → 在验证过程中逐步拼凑全貌
- E. 先遭遇一次失败的暗杀/袭击 → 从刺客/袭击者身上反查线索 → 层层扒出幕后链条

**维度四：临时变量角色（植入1个短期活跃角色，阶段结束后离场）**
- A. 失去记忆的敌方核心成员（被主角捡到，提供矛盾/混乱的信息）
- B. 对主角有私人恩怨的旧相识（不关心主线，只盯着主角寻仇或追债）
- C. 拥有关键技能但性格极端怪癖的专家（必须完成奇怪仪式/条件才肯出手）
- D. 完全不懂行情的局外人（孩童/老人/异乡人，因无知而好心办坏事，引发连锁危机）
- E. 伪装成盟友的监视者（表面上帮助主角，实则每步都在向第三方传递情报）
- F. 具有特殊身份的信使/商人（带来一件看似无关、后期才显现用途的物品）
- G. 主角曾经的崇拜者/追随者（盲目信任主角，但其行为反而将主角架在火上烤）

**维度五：各阶段成败结算状态（抽3个，可重复）**
- A. 惨胜（达成阶段目标，但损失不可逆——关键资源/重要伙伴/主角健康严重受损）
- B. 平局/僵持（既没拿到也没失去，双方被迫妥协或暂歇）
- C. 假性胜利（以为成功了，实则是陷阱，后续全面被动甚至反噬）
- D. 部分失败（只达成50%的目标，必须启用极端备用方案）
- E. 意外收获（阶段任务失败了，却歪打正着获得了另一个更有价值的信息/物品）
- F. 惨败后翻盘（全面溃败，但在绝境中依靠某位配角的牺牲/某件道具的隐藏功能惊险逆转）

**【生成指令】**

> 请你基于以上全部设定，执行以下任务：
>
> 1. 在输出开头公布抽取结果，格式如下：
>    阻力源：阶段一[X] 阶段二[X] 阶段三[X]
>    三场重头戏场景：场景1-[X] / 场景2-[X] / 场景3-[X]
>    情报顺序：[X]
>    临时角色：[X]
>    结算状态顺序：阶段一-[X] / 阶段二-[X] / 阶段三-[X]
>
> 2. 按照抽取结果，生成完整的中段情节大纲（每个阶段单独成章）：
>    - 每个阶段至少包含3个具体的事件/冲突场景
>    - 每个阶段必须体现该阶段抽取到的阻力源和结算状态
>    - 三场重头戏场景分别嵌入三个不同阶段中，作为该阶段的核心高潮或转折点
>    - 临时变量角色必须在至少一个阶段中成为情节的关键推动者，并在阶段结束后合理退场
>    - 情报揭露顺序必须贯穿整个中段
>    - 所有情节必须与固定设定和主线故事线保持一致`;
}

/** 组装"生成大纲"完整 Prompt */
export function buildGenOutlinePrompt(
  novelId: string,
  novel: Record<string, unknown>,
  characters: Record<string, unknown>[],
  organizations: Record<string, unknown>[],
  locations: Record<string, unknown>[],
  relations: { source: string; target: string; description: string }[],
  framework: string,
  frameworkContent?: string,
  userPrompt?: string,
): string {
  const parts: string[] = [];

  // ── 任务头部 ──
  parts.push("# 任务：根据小说设定和大纲架构类型，生成大纲");
  if (userPrompt) {
    parts.push(`\n> **额外要求**：${userPrompt}`);
  }
  parts.push(`\n> **选中的大纲框架**：${framework}`);

  // ── 大纲架构模板 ──
  const template = frameworkContent ?? `（框架模板内容为空）`;
  parts.push(`\n---`);
  parts.push(`\n## 大纲框架模板`);
  parts.push(`\n${template}`);

  // ── 小说基本信息 ──
  parts.push(`\n---`);
  parts.push(formatNovelSection(novel));

  // ── 实体数据 ──
  parts.push(formatCharactersSection(characters));
  parts.push(formatOrganizationsSection(organizations));
  parts.push(formatLocationsSection(locations));

  // ── 角色关系网络 ──
  parts.push(formatRelationsSection(relations, characters));

  // ── 情节生成规则 ──
  parts.push(`\n---`);
  parts.push(buildRandomizationRules());

  // ── 输出格式 ──
  parts.push(`\n---`);
  parts.push(`\n## 输出格式`);
  parts.push(`\n直接输出完整的 markdown 文档。不要用 JSON、代码块或任何包裹符号：`);
  parts.push(`\n\`\`\``);
  parts.push(`# 小说大纲标题`);
  parts.push(``);
  parts.push(`## 第一幕 / 第1章 标题`);
  parts.push(`- 情节要点`);
  parts.push(`- 冲突设计`);
  parts.push(``);
  parts.push(`## 第二幕 / 中段 1`);
  parts.push(`- 抽取结果展示`);
  parts.push(`- 核心冲突场景`);
  parts.push(`- ...`);
  parts.push(``);
  parts.push(`## 第三幕 / 终局`);
  parts.push(`- ...`);
  parts.push(`\`\`\``);

  parts.push(`\n### 内容要求`);
  parts.push(`\n- 使用 \`#\` / \`##\` 标题层级组织大纲`);
  parts.push(`- 引用实体时使用角色/组织/地点的 **name** 名称`);
  parts.push(`- 充分利用角色关系网络和抽取变量来设计剧情冲突`);

  // ── 规则约束 ──
  parts.push(`\n### 规则约束`);
  parts.push(`\n1. 直接输出 markdown，不要用 JSON 或代码块包裹`);
  parts.push(`2. 开头必须展示【本轮变量抽取结果】`);
  parts.push(`3. 大纲内容要结合小说具体设定，不能泛泛而谈`);
  parts.push(`4. 让情节发展合情合理，不要为了推动而推动，不要太过顺利`);
  parts.push(`5. 不要使用莫名其妙的伪专业词汇，如果非得用，就先说大白话解释清楚`);

  return parts.join("\n");
}
