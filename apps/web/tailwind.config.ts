import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agent: {
          ink: "#111827",
          muted: "#667085",
          line: "#d9dee8",
          panel: "#ffffff",
          wash: "#f6f8fb",
          cyan: "#0e7490",
          green: "#15803d",
          amber: "#b45309",
          rose: "#be123c"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(17, 24, 39, 0.08)",
        lift: "0 12px 28px rgba(17, 24, 39, 0.12)"
      }
    }
  }
};

export default config;
