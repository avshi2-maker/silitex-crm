import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { 50: "#eef6ff", 100: "#d9eaff", 500: "#1d5fd1", 600: "#174ca8", 700: "#123a80", 900: "#0b2350" } } } },
  plugins: [],
} satisfies Config;
