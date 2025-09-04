import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

export default {
  
darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1rem", 
          md: "2rem",
          lg: "2rem",
          xl: "2rem",
          "2xl": "2rem",
        },
        screens: {
          "2xl": "1400px",
        },
      },
      // Thêm các custom colors cho shadcn/ui dựa trên CSS variables
      colors: {
        // Shadcn/ui colors
        "shadcn-border": "hsl(214.3 31.8% 91.4%)",
        "shadcn-input": "hsl(214.3 31.8% 91.4%)", 
        "shadcn-ring": "hsl(222.2 84% 4.9%)",
        "shadcn-background": "hsl(0 0% 100%)",
        "shadcn-foreground": "hsl(222.2 84% 4.9%)",
        "shadcn-primary": {
          DEFAULT: "hsl(222.2 47.4% 11.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        "shadcn-secondary": {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        "shadcn-destructive": {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        "shadcn-muted": {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        "shadcn-accent": {
          DEFAULT: "hsl(210 40% 96%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        "shadcn-popover": {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        "shadcn-card": {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
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
  plugins: [forms, typography, animate],
} satisfies Config;


