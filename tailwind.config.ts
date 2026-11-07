import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
        card: "0 1px 3px 0 rgba(16, 24, 40, 0.06)",
        "card-hover": "0 12px 28px -6px rgba(27, 54, 93, 0.12)",
      },
      colors: {
        navy: { DEFAULT: token("navy"), strong: token("navy-strong") },
        brand: { DEFAULT: token("brand"), strong: token("brand-strong"), soft: token("brand-soft"), light: token("blue-light") },
        canvas: token("canvas"),
        surface: token("surface"),
        subtle: token("subtle"),
        ink: { DEFAULT: token("ink"), muted: token("muted") },
        line: { DEFAULT: token("line"), field: token("field"), blue: token("border-blue") },
        success: { DEFAULT: token("success"), soft: token("success-soft") },
        warning: { DEFAULT: token("warning"), soft: token("warning-soft") },
        danger: { DEFAULT: token("danger"), soft: token("danger-soft") },
        info: { DEFAULT: token("info"), soft: token("info-soft") },
        // alias lama agar komponen lama tetap berfungsi
        beesha: {
          navy: "#1B365D",
          blue: "#0077C8",
          silver: "#F2F4F7",
          charcoal: "#1E293B",
          border: "#D9E0E8",
        },
      },
      borderRadius: {
        field: "10px",
        card: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
