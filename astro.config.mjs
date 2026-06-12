import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://dsteele.dev",
  vite: {
    server: {
      watch: {
        ignored: [
          "**/.lighthouseci/**",
          "**/coverage/**",
          "**/dist/**",
          "**/npm-debug.log*",
          "**/yarn-debug.log*",
          "**/yarn-error.log*",
          "**/pnpm-debug.log*",
        ],
      },
    },
  },
});
