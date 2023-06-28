import type { Primitive } from "type-fest";
import type {
  // gql-codegen types:
  Invoice,
  Profile,
  User,
  WorkOrder,
  // gql-codegen utility-types:
  Maybe,
} from "./graphql";

/**
 * This mapping generic converts gql-codegen's `Maybe<T>` type to `T | null`.
 * > To remove `null` completely, use {@link NonNullableGqlType}.
 */
export type UnwrapGqlMaybeType<T extends Record<string, unknown>> = {
  [Key in keyof T]: UnwrapMaybeValue<T[Key]>;
};

/** Utility type used by `UnwrapGqlMaybeType` */
type UnwrapMaybeValue<T> = T extends Maybe<infer Value>
  ? Primitive | Date extends Value
    ? Value | null
    : Value extends Record<PropertyKey, any>
    ? UnwrapGqlMaybeType<Value> | null
    : Value extends Array<infer Element>
    ? Array<UnwrapMaybeValue<Element>> | null
    : Value | null
  : T;

/**
 * This mapping generic excludes `null` from all values, and works with
 * gql-codegen's `Maybe<T>` type, which is unwrapped in the process.
 *
 * - Input: `{ foo?: Maybe<string> | undefined }`
 * - Output: `{ foo?: string | undefined }`
 */
export type NonNullableGqlType<T extends Record<string, unknown>> = {
  [Key in keyof T]: RecursiveNonNullable<T[Key]>;
};

type RecursiveNonNullable<T> = T extends Primitive | Date
  ? Exclude<T, null>
  : T extends Record<string, any>
  ? Exclude<{ [Key in keyof T]: RecursiveNonNullable<T[Key]> }, null>
  : T extends Array<infer Element>
  ? Exclude<Array<RecursiveNonNullable<Element>>, null>
  : Exclude<T, null>;

export type NonNullableInvoice = NonNullableGqlType<Invoice>;
export type NonNullableProfile = NonNullableGqlType<Profile>;
export type NonNullableUser = NonNullableGqlType<User>;
export type NonNullableWorkOrder = NonNullableGqlType<WorkOrder>;
