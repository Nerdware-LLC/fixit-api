# 🧪 Test Files

This dir contains the following:

- [The test suites setup file](./setupTests.ts), which implements custom matchers and commonly-used mocks for every test suite.
  - Custom matcher type declarations can be found [in the Vitest type-declarations file](../types/vitest.d.ts).
- End-to-end tests (the files prefixed with `e2e.`)
- Static mock items, which are commonly used as inputs for various test suites.

This dir and its contents are explicitly ignored by [SWC when creating builds](../../.swcrc).

> In this project, all test suite files are suffixed with `.test.ts`.
