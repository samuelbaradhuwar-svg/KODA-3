import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      // The private command centre is a second page; the public site is index.html. (SSR builds name their own entry.)
      input: { main: "index.html", command: "command.html" },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
          if (id.includes("phosphor-icons")) return "icons";
        },
      },
    },
  },
});
