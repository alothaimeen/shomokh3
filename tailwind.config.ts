import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          purple: '#8B5CF6',  // أغمق للخلفية - أكثر حيوية
          blue: '#3B82F6',    // أغمق للخلفية - أكثر وضوحاً
        },
        secondary: {
          dark: '#615D6B',
          purple: '#A78BFA', // للعناصر الفاتحة
          blue: '#60A5FA',   // للعناصر الفاتحة
        },
      },
    },
  },
  plugins: [],
};
export default config;