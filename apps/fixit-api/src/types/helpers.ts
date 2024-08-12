/**
 * This file contains helpful generic util types used throughout the project that
 * achieve behavior that's not offered by type-fest's util types nor TypeScript's
 * built-in generics.
 */

/**
 * Intermediate type used by {@link CombineUnionOfObjects}.
 */
type AddMissingFieldsAsPartial<
  T extends object,
  K extends PropertyKey = T extends unknown ? keyof T : never,
> = T extends unknown ? T & Partial<Record<Exclude<K, keyof T>, undefined>> : never;

/**
 * This generic is similar to type-fest's `UnionToIntersection`, but object properties that
 * aren't present in all union members are made optional and unioned with `undefined`. The
 * result always includes _every_ field from every union member — even `never` value types.
 *
 * @example
 * ```ts
 * type A = { a: "foo"; b: string; c?: string };
 *
 * type B = { a: "bar"; b: unknown; c: number; x: "X"; y: never };
 *
 * type C = CombineUnionOfObjects<A | B>;
 * /* Type C is equivalent to:
 *    {
 *      a: "foo" | "bar";    <-- "foo" | "bar" because both A and B use literals
 *      b: unknown;          <-- More generic types always override more specific types
 *      c?: string | number; <-- Types of equal specificity are unioned
 *      x?: "X" | undefined; <-- Only B contains x, so it's optional and unioned with `undefined`
 *      y?: undefined;       <-- The result always includes EVERY key — even `never` value types
 *    }
 * ```
 */
export type CombineUnionOfObjects<T extends object> = {
  [Key in keyof AddMissingFieldsAsPartial<T>]: AddMissingFieldsAsPartial<T>[Key];
};
