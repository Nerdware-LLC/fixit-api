import viteTsconfigPaths from "vite-tsconfig-paths";
import GithubActionsReporter from "vitest-github-actions-reporter";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  plugins: [
    viteTsconfigPaths({
      projects: [mode === "production" ? "./tsconfig.build.json" : "./tsconfig.json"],
    }),
  ],
  test: {
    globals: true,
    clearMocks: true,
    mockReset: true,
    environment: "node",
    include: ["**/?(*.){test,spec}.?(c|m)[tj]s?(x)"],
    setupFiles: ["src/__tests__/setupTests.ts"],
    reporters: ["default", ...(process.env.GITHUB_ACTIONS ? [new GithubActionsReporter()] : [])],
    coverage: {
      include: ["src/**/*.{js,ts}"],
      exclude: ["src/__tests__/**/*.{js,ts}", "**/__mocks__/**/*", "__mocks__/**/*"],
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
}));
