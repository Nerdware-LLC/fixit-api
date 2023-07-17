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
    mockReset: true, // <-- recommended for aws-sdk-client-mock
    environment: "node",
    include: ["**/?(*.){test,spec}.?(c|m)[tj]s?(x)"],
    setupFiles: ["dotenv/config", "src/__tests__/setupTests.ts"],
    globalSetup: ["src/__tests__/globalSetup.ts"],
    reporters: [
      "default", // prettier-ignore
      ...(process.env.GITHUB_ACTIONS ? [new GithubActionsReporter()] : []),
    ],
    coverage: {
      include: ["src/**/*.{js,ts}"],
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
