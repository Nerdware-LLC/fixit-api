export {};

declare global {
  /**
   * `Writeable` removes `readonly` access modifiers from type `<T>`.
   * - For recursive readonly removal, use `WriteableR` (add "R" suffix).
   */
  type Writeable<T> = { -readonly [P in keyof T]: T[P] };

  /**
   * `WriteableR` recursively removes `readonly` access modifiers from type `<T>`.
   * - For non-recursive readonly removal, use `Writeable` (no "R" suffix).
   */
  type WriteableR<T> = T extends object
    ? { -readonly [P in keyof T]: WriteableR<T[P]> }
    : T extends Array<infer E>
    ? Array<WriteableR<E>>
    : T;
}
