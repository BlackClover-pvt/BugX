import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 15_000,
    hookTimeout: 15_000,
    include: ["src/__tests__/**/*.test.ts"],
    reporters: ["verbose"],
    env: { NODE_ENV: "test" },
  },
  resolve: {
    extensions: [".ts", ".js", ".mjs", ".cjs", ".json"],
    alias: {
      // Redirect legacy CJS require of ai.service (no extension) to the .ts file
      "../services/ai.service": new URL("./src/services/ai.service.ts", import.meta.url).pathname,
    },
  },
});
