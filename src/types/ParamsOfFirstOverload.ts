/**
 * Like `Parameters`, only using the _first_ overload if multiple call signatures exist,
 * rather than the _last_ overload. This is useful for working with Stripe API typings,
 * which currently place function overloads with _more_ args before those with _fewer_
 * args (resulting in `Parameters` defaulting to the _least_ specific overload).
 */
export type ParamsOfFirstOverload<T> = T extends {
  (...args: infer Params): unknown;
  (...args: any[]): any;
}
  ? Params
  : T extends (...args: any[]) => any
  ? Parameters<T>
  : never;
