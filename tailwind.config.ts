import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 琥珀设计系统主色 - amber 前缀避免与 shadcn/ui accent 冲突
        amber: {
          50: "#fdf6ef",
          100: "#f9e6d2",
          200: "#f0c9a3",
          300: "#e4a76e",
          400: "#daa882",
          500: "#c8956c",
          600: "#a06b3e",
          700: "#855534",
          800: "#6d4530",
          900: "#5b3b2b",
        },
        // 背景色阶
        bg: {
          950: "#0f0e0c",
          900: "#131210",
          850: "#16140f",
          800: "#1a1815",
          700: "#211f1a",
          600: "#2a2722",
          500: "#3a352c",
          400: "#4a4438",
          300: "#6a6258",
          200: "#9a9080",
          100: "#c4baa8",
          50: "#e8e0d0",
        },
        // 文字色阶
        fg: {
          primary: "#e8e0d0",
          secondary: "#9a9080",
          tertiary: "#6a6258",
          disabled: "#4a4438",
        },
        // 语义色
        success: {
          DEFAULT: "#6bab72",
          light: "#a8d5ab",
          deep: "#4a8a52",
        },
        warning: {
          DEFAULT: "#d4a843",
          light: "#e8c96a",
          deep: "#b08a2e",
        },
        danger: {
          DEFAULT: "#c76060",
          light: "#e89898",
          deep: "#a34545",
        },
        info: {
          DEFAULT: "#5a96be",
          light: "#8ab4d4",
          deep: "#3d7499",
        },
        // Shadcn/UI 兼容变量
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      spacing: {
        18: "4.5rem",
      },
      radius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      shadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--shadow-glow)",
        glowLg: "var(--shadow-glow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}

export default config