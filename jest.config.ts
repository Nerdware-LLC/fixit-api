import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

// Jest config file docs: https://jestjs.io/docs/configuration

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**"
  ],
  coverageDirectory: "coverage",
  extensionsToTreatAsEsm: [".ts"],
  globalSetup: "<rootDir>/src/__tests__/globalSetup.cjs",
  moduleFileExtensions: ["ts", "js", "cts", "cjs", "json"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  preset: "ts-jest/presets/js-with-ts-esm",
  rootDir: "./",
  setupFiles: ["dotenv/config"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.[tj]s"],
  testTimeout: 15000, // 15s
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true
      }
    ]
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true
};

export default jestConfig;
