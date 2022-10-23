export {};

declare global {
  /**
   * `Expand` expands the typedef of `<T>` in your IDE's Intellisense.
   * - Works on functions, promises, arrays, and objects.
   * - If `<T>` is an object or array, it will only be expanded one level deep.
   * - Date objects are not expanded.
   * - For recursive expansion, use `ExpandR` (add "R" suffix).
   */
  type Expand<T> = T extends (...args: infer A) => infer FR
    ? (...args: Expand<A>) => Expand<FR>
    : T extends Promise<infer PR>
    ? Promise<Expand<PR>>
    : T extends Array<infer E>
    ? Array<Expand<E>>
    : T extends Date
    ? T
    : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never;

  /**
   * `ExpandR` recursively expands typedef of `<T>` in your IDE's Intellisense.
   * - Works on functions, promises, arrays, and objects.
   * - Date objects are not expanded.
   * - For non-recursive expansion, use `Expand` (no "R" suffix).
   */
  type ExpandR<T> = T extends (...args: infer A) => infer FR
    ? (...args: ExpandR<A>) => ExpandR<FR>
    : T extends Promise<infer PR>
    ? Promise<ExpandR<PR>>
    : T extends Array<infer E>
    ? Array<ExpandR<E>>
    : T extends Date
    ? T
    : T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandR<O[K]> }
      : never
    : T;
}
