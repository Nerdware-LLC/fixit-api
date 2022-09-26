export {};

// This file contains utilities which add conditionality to the Partial and Required util-types.

declare global {
  /**
   * `ConditionalPartial` is a utility-type generic which conditionally adds
   * the "?" mapping modifier to properties of type `<T>` with types that match
   * the type of the interface provided to the 2nd type parameter. All properties
   * with types which extend `MatchInterface` will be wrapped in `Partial<>`.
   */
  type ConditionalPartial<T, MatchInterface> = Intersection<
    Partial<Pick<T, Matching<T, MatchInterface>>>,
    Required<Pick<T, NonMatching<T, MatchInterface>>>
  >;

  /**
   * `ConditionalRequired` is a utility-type generic which conditionally removes
   * the "?" mapping modifier from properties of type `<T>` with types that match
   * the type of the interface provided to the 2nd type parameter. All properties
   * with types which extend `MatchInterface` will be wrapped in `Required<>`.
   */
  type ConditionalRequired<T, MatchInterface> = Intersection<
    Required<Pick<T, Matching<T, MatchInterface>>>,
    Partial<Pick<T, NonMatching<T, MatchInterface>>>
  >;

  /**
   * `Intersection` is a utility-type generic which creates type intersections
   * using the _`extends infer`_ technique. Unlike syntactical type intersection
   * using the "&" operator, this generic results in a single combined type in
   * IDE intellisense.
   */
  type Intersection<A, B> = A & B extends infer U ? { [P in keyof U]: U[P] } : never;

  /**
   * `Matching` is a utility-type generic which provides a union of keys from
   * type `<T>` the values of which can extend the `MatchInterface` provided
   * to the 2nd type parameter.
   */
  type Matching<T, MatchInterface> = {
    [K in keyof T]: T[K] extends MatchInterface ? K : never;
  }[keyof T];

  /**
   * `NonMatching` is a utility-type generic which provides a union of keys from
   * type `<T>` the values of which can NOT extend the `MatchInterface` provided
   * to the 2nd type parameter.
   */
  type NonMatching<T, MatchInterface> = {
    [K in keyof T]: T[K] extends MatchInterface ? never : K;
  }[keyof T];

  /**
   * `PickMatching` is a shorthand combination of `Pick` and `Matching`.
   */
  type PickMatching<T, MatchInterface> = Pick<T, Matching<T, MatchInterface>>;

  /**
   * `PickNonMatching` is a shorthand combination of `Pick` and `NonMatching`.
   */
  type PickNonMatching<T, MatchInterface> = Pick<T, NonMatching<T, MatchInterface>>;
}
