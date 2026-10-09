import type { Config } from "tailwindcss";
// Silitex brand: magenta (#E2007A) on white; charcoal sidebar.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    brand: { 50: "#FDF2F8", 100: "#FCE7F3", 500: "#E2007A", 600: "#BE0068", 700: "#9B0057", 900: "#3B0022" },
    ink: { 700: "#3A3A42", 800: "#2A2A31", 900: "#1B1B20" },
  } } },
  plugins: [],
} satisfies Config;
