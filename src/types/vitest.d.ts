// eslint-disable-next-line node/no-unpublished-import, @typescript-eslint/no-unused-vars
import type { Assertion, AsymmetricMatchersContaining } from "vitest";

/*
  This file adds custom matchers to the Vitest assertion interface.
  See docs: https://vitest.dev/guide/extending-matchers.html
*/

interface CustomMatchers<_ = unknown, R = unknown> {
  /** Test if the `received` value matches one of the values in the `expected` array. */
  toBeOneOf(expected: Array<unknown>): R;
}

declare module "vitest" {
  interface AsymmetricMatchersContaining extends CustomMatchers {
    /**
     * Test if the `received` value passes the provided function.
     * This is an asymmetric version of the existing [`toSatisfy`][toSatisfyLink] matcher.
     *
     * [toSatisfyLink]: https://vitest.dev/api/expect.html#tosatisfy
     */
    toSatisfyFn<MatcherFnArg>(matcherFn: (value: MatcherFnArg) => boolean): unknown;
    toBeValidDate(): unknown;
  }
}
