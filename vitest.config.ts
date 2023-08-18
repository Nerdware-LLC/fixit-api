import viteTsconfigPaths from "vite-tsconfig-paths";
import GithubActionsReporter from "vitest-github-actions-reporter";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    viteTsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  test: {
    globals: true,
    clearMocks: true,
    mockReset: true,
    environment: "node",
    include: ["**/?(*.){test,spec}.?(c|m)[tj]s?(x)"],
    setupFiles: ["src/tests/setupTests.ts"],
    reporters: ["default", ...(process.env.GITHUB_ACTIONS ? [new GithubActionsReporter()] : [])],
    coverage: {
      include: ["src/**/*.{js,ts}"],
      exclude: ["src/tests/**/*.{js,ts}", "**/__mocks__/**/*", "__mocks__/**/*"],
      reporter: [
        // Default reporters:
        "text",
        "html",
        "clover",
        "json",
        // Required for vitest-coverage-report GitHub Action:
        "json-summary",
      ],
    },
  },
});
