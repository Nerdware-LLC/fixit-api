import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

// Jest config file docs: https://jestjs.io/docs/configuration

// prettier-ignore
const config: Config.InitialOptions = {
  clearMocks: true,                             /* Automatically clear mock calls and instances between every test */
  collectCoverage: true,                        /* Indicates whether the coverage information should be collected while executing the test */
  collectCoverageFrom: [                        /* An array of glob patterns indicating a set of files for which coverage information should be collected */
    "**/*.{js}",
    "**/*.{ts}",
    "!**/node_modules/**",
    "!.github/**/*",
    "!build/**/*",
    "!coverage/**/*",
    "!apollo.config.js",
    "!jest.config.js"
  ],
  coverageDirectory: "coverage",                /* The directory where Jest should output its coverage files */
  extensionsToTreatAsEsm: [".ts"],              /* Extensions to run as ESM (.js and .mjs are included by default, listing them below causes error) */
  globals: {                                    /* A set of global variables that need to be available in all test environments */
    "ts-jest": {
      tsconfig: "tsconfig.json",
      useESM: true
    }
  },
  moduleFileExtensions: [                       /* An array of file extensions your modules use */
    "ts", "js", "json"
  ],
  moduleNameMapper: pathsToModuleNameMapper(    /* A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module */
    compilerOptions.paths,
    { prefix: "<rootDir>/" }
  ),
  preset: "ts-jest/presets/default-esm",        /* A preset that is used as a base for Jest's configuration */
  roots: ["<rootDir>"],                         /* A list of paths to directories that Jest should use to search for files in */
  setupFiles: ["dotenv/config"],                /* Paths to modules that run BEFORE "setupFilesAfterENV" and test suite files */
  testEnvironment: "node",                      /* The test environment that will be used for testing */
  testMatch: [                                  /* The glob patterns Jest uses to detect test files */
    "<rootDir>/src/**/*.test.[tj]s"
  ],
  transform: {                                  /* A map from regular expressions to paths to transformers */
    "^.+.(js|ts)$": "ts-jest"
  },
  transformIgnorePatterns: [                    /* An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation */
    "node_modules/"
  ]
};

export default config;
