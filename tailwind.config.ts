import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
      colors: {
        beesha: {
          navy: "#1B365D",
          blue: "#0077C8",
          silver: "#F2F4F7",
          charcoal: "#1E293B",
          border: "#D9E0E8",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
