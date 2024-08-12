// @ts-check
import eslintJS from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import";
import nodePlugin from "eslint-plugin-node";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";
import tsEslint from "typescript-eslint";

/** @type { import("eslint").Linter.FlatConfig } */
export default [
  ////////////////////////////////////////////////////////////////
  // ALL FILES
  {
    files: ["src/**/*.ts", "./*.[tj]s", "__mocks__/**/*.ts"],
    ignores: ["src/**/__codegen__/**/*"], // don't lint generated code
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsEslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          globalReturn: false,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint.plugin,
      import: importPlugin,
      node: nodePlugin,
    },
    rules: {
      // MERGE PRESETS:
      ...eslintJS.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs["typescript"].rules,
      ...nodePlugin.configs.recommended.rules,
      ...tsEslint.configs.eslintRecommended.rules, // turns off base eslint rules covered by ts-eslint
      ...[
        ...tsEslint.configs.strictTypeChecked,
        ...tsEslint.configs.stylisticTypeChecked, // prettier-ignore
      ].reduce((acc, { rules = {} }) => ({ ...acc, ...rules }), {}),
      // RULE CUSTOMIZATIONS:
      "default-case": "error", //      switch-case statements must have a default case
      "default-case-last": "error", // switch-case statements' default case must be last
      eqeqeq: ["error", "always"],
      "no-console": "warn",
      "prefer-const": ["warn", { destructuring: "all" }],
      "prefer-object-has-own": "error",
      "prefer-promise-reject-errors": "error",
      semi: ["error", "always"],
      "import/named": "off", //                      TS performs this check
      "import/namespace": "off", //                  TS performs this check
      "import/default": "off", //                    TS performs this check
      "import/no-named-as-default": "off", //        TS performs this check
      "import/no-named-as-default-member": "off", // TS performs this check
      "node/no-missing-import": "off", //   Does not work with path aliases
      "node/no-process-env": "error",
      "node/no-unpublished-import": ["error", { allowModules: ["type-fest"] }],
      "node/no-unsupported-features/es-syntax": "off", //             Allow dynamic import (no config option)
      "@typescript-eslint/array-type": "off", //                      Allow "T[]" and "Array<T>"
      "@typescript-eslint/consistent-indexed-object-style": "off", // Allow "Record<K, V>" and "{ [key: K]: V }"
      "@typescript-eslint/consistent-type-definitions": "off", //     Allow "type" and "interface", there are subtle usage differences
      "@typescript-eslint/no-confusing-void-expression": "off", //    Allow 1-line arrow fns to return void for readability
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
      "@typescript-eslint/no-extraneous-class": ["error", { allowStaticOnly: true }],
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { arguments: false } },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off", // Allow "if (x === true)"
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: false,
        },
      ],
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignoreConditionalTests: true,
          ignorePrimitives: { string: true },
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowNever: false,
          allowArray: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
        },
      ],
      ...eslintConfigPrettier.rules, // <-- must be last, removes rules that conflict with prettier
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        node: true,
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  ////////////////////////////////////////////////////////////////
  // TEST FILES
  {
    files: ["src/**/*.test.ts", "src/**/tests/**/*", "src/**/__mocks__/**/*", "__mocks__/**/*"],
    languageOptions: {
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      "vitest/consistent-test-it": ["error", { fn: "test" }],
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": ["warn", { fixable: false }],
      "vitest/prefer-lowercase-title": ["error", { ignore: ["describe"] }],
      "vitest/prefer-to-be-truthy": "off",
      "vitest/prefer-to-be-falsy": "off",
      "vitest/valid-expect": "warn",
      "node/no-unpublished-import": [
        "error",
        { allowModules: ["type-fest", "vitest", "supertest", "@graphql-tools/mock"] },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  ////////////////////////////////////////////////////////////////
  // NON-TEST FILES
  {
    files: ["src/**/*"],
    ignores: ["src/**/*.test.ts", "src/**/tests/**/*", "src/**/__mocks__/**/*", "__mocks__/**/*"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/tests/*"],
              message:
                "Test-related exports like mocks should only be imported in test-related files. " +
                "If this file is part of a test suite, please rename it to match the pattern *.test.*",
            },
          ],
        },
      ],
    },
  },
  ////////////////////////////////////////////////////////////////
];
