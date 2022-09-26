export {};

// The generic utility-types in this file provide useful extensions of NonNullable.

declare global {
  /**
   * `NonNullableKeys`
   * - This generic utility-type makes the specified keys of type `<T>` NonNullable.
   * - No keys are excluded from the result.
   * - Optional property modifiers are also removed.
   * - If `<T>` itself is nullable, it will first need to be wrapped in NonNullable.
   *
   * ```ts
   * // Below example results in type Foo = { a: string; b: string; c: string | undefined }
   * type Foo = NonNullableKeys<{
   *   a: string | undefined;
   *   b?: string | undefined;  // <-- note: optional property modifiers are also removed
   *   c: string | undefined;
   * }, "a" | "b">;
   * ```
   */
  type NonNullableKeys<T, NonNullableKeysUnion extends keyof T> = T extends Record<
    string | number | symbol,
    any
  >
    ? Expand<{ [K in NonNullableKeysUnion]-?: NonNullable<T[K]> } & Omit<T, NonNullableKeysUnion>>
    : never;

  /**
   * `PickNonNullable`
   * - This generic utility-type combines the `Pick` and `NonNullable` utilities.
   * - Resultant type contains only the specified keys, all of which are set to NonNullable.
   * - Optional property modifiers are also removed.
   * - If `<T>` itself is nullable, it will first need to be wrapped in NonNullable.
   *
   * ```ts
   * // Below example results in type Foo = { a: string; b: string }
   * type Foo = PickNonNullable<{
   *   a: string | undefined;
   *   b?: string | undefined;  // <-- note: optional property modifiers are also removed
   *   c: string | undefined;
   * }, "a" | "b">;
   * ```
   */
  type PickNonNullable<T, NonNullableKeysUnion extends keyof T> = T extends Record<
    string | number | symbol,
    any
  >
    ? Expand<{ [K in NonNullableKeysUnion]-?: NonNullable<T[K]> }>
    : never;
}
