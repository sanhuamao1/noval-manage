/** 颜色名 */
export type ColorName =
  | "primary" | "success" | "warn" | "danger" | "neutral" | "default"
  | "red" | "rose" | "orange"
  | "yellow" | "lime" | "emerald"
  | "teal" | "cyan" | "sky" | "blue" | "indigo"
  | "violet" | "purple" | "fuchsia" | "pink"

/**
 * Tag 组件颜色样式
 * 格式：bg-{色}-500/10  text-{色}-400  border-{色}-500/25
 */
export const TAG_COLORS: Record<string, string> = {
  primary:  "bg-amber-500/10 text-amber-400 border-amber-500/25",
  success:  "bg-green-500/10 text-green-400 border-green-500/25",
  warn:     "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  danger:   "bg-red-500/10 text-red-400 border-red-500/25",
  neutral:  "bg-slate-500/10 text-slate-400 border-slate-500/25",
  default:  "bg-bg-800 text-fg-secondary border-border-subtle",
  red:      "bg-red-500/10 text-red-400 border-red-500/25",
  rose:     "bg-rose-500/10 text-rose-400 border-rose-500/25",
  orange:   "bg-orange-500/10 text-orange-400 border-orange-500/25",
  yellow:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  lime:     "bg-lime-500/10 text-lime-400 border-lime-500/25",
  emerald:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  teal:     "bg-teal-500/10 text-teal-400 border-teal-500/25",
  cyan:     "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  sky:      "bg-sky-500/10 text-sky-400 border-sky-500/25",
  blue:     "bg-blue-500/10 text-blue-400 border-blue-500/25",
  indigo:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  violet:   "bg-violet-500/10 text-violet-400 border-violet-500/25",
  purple:   "bg-purple-500/10 text-purple-400 border-purple-500/25",
  fuchsia:  "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/25",
  pink:     "bg-pink-500/10 text-pink-400 border-pink-500/25",
}

/**
 * RadioGroup 选项颜色样式
 * 格式：border-{色}-500  bg-{色}-950/40  text-{色}-400
 */
export const RADIO_COLORS: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  primary:  { border: "border-blue-500",    bg: "bg-blue-950/40",    text: "text-blue-400",    icon: "text-blue-400" },
  success:  { border: "border-emerald-500", bg: "bg-emerald-950/40", text: "text-emerald-400", icon: "text-emerald-400" },
  warn:     { border: "border-orange-500",  bg: "bg-orange-950/40",  text: "text-orange-400",  icon: "text-orange-400" },
  danger:   { border: "border-red-500",     bg: "bg-red-950/40",     text: "text-red-400",     icon: "text-red-400" },
  neutral:  { border: "border-slate-500",   bg: "bg-slate-800/40",   text: "text-slate-400",   icon: "text-slate-400" },
  red:      { border: "border-red-500",     bg: "bg-red-950/40",     text: "text-red-400",     icon: "text-red-400" },
  rose:     { border: "border-rose-500",    bg: "bg-rose-950/40",    text: "text-rose-400",    icon: "text-rose-400" },
  orange:   { border: "border-orange-500",  bg: "bg-orange-950/40",  text: "text-orange-400",  icon: "text-orange-400" },
  yellow:   { border: "border-yellow-500",  bg: "bg-yellow-950/40",  text: "text-yellow-400",  icon: "text-yellow-400" },
  lime:     { border: "border-lime-500",    bg: "bg-lime-950/40",    text: "text-lime-400",    icon: "text-lime-400" },
  emerald:  { border: "border-emerald-500", bg: "bg-emerald-950/40", text: "text-emerald-400", icon: "text-emerald-400" },
  teal:     { border: "border-teal-500",    bg: "bg-teal-950/40",    text: "text-teal-400",    icon: "text-teal-400" },
  cyan:     { border: "border-cyan-500",    bg: "bg-cyan-950/40",    text: "text-cyan-400",    icon: "text-cyan-400" },
  sky:      { border: "border-sky-500",     bg: "bg-sky-950/40",     text: "text-sky-400",     icon: "text-sky-400" },
  blue:     { border: "border-blue-500",    bg: "bg-blue-950/40",    text: "text-blue-400",    icon: "text-blue-400" },
  indigo:   { border: "border-indigo-500",  bg: "bg-indigo-950/40",  text: "text-indigo-400",  icon: "text-indigo-400" },
  violet:   { border: "border-violet-500",  bg: "bg-violet-950/40",  text: "text-violet-400",  icon: "text-violet-400" },
  purple:   { border: "border-purple-500",  bg: "bg-purple-950/40",  text: "text-purple-400",  icon: "text-purple-400" },
  fuchsia:  { border: "border-fuchsia-500", bg: "bg-fuchsia-950/40", text: "text-fuchsia-400", icon: "text-fuchsia-400" },
  pink:     { border: "border-pink-500",    bg: "bg-pink-950/40",    text: "text-pink-400",    icon: "text-pink-400" },
}
