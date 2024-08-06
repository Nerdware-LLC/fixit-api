import { SUBSCRIPTION_ENUMS as SUB_ENUMS } from "@/models/UserSubscription/enumConstants.js";
import { WORK_ORDER_ENUM_CONSTANTS as WO_ENUMS } from "@/models/WorkOrder/enumConstants.js";
import type { UndefinedOnPartialDeep, Writable } from "type-fest";
import type {
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
  ZodSchema,
  ZodObject,
  ZodArray,
  ZodEnum,
  ZodBoolean,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodEffects,
} from "zod";
import type {
  SubscriptionPriceName,
  SubscriptionStatus,
  WorkOrderCategory,
  WorkOrderPriority,
  WorkOrderStatus,
} from "./graphql.js";

// This file contains Zod util types

/**
 * Create a ZodSchema type that matches an existing type T.
 *
 * > - Use this type for simple `satisfies` checks.
 * > - For more complex use cases, use {@link ZodObjectWithShape}.
 */
export type ZodSchemaWithShape<T extends Record<string, unknown>> = ZodSchema<
  T,
  ZodTypeDef,
  UndefinedOnPartialDeep<T>
>;

/**
 * Create a ZodObject type that matches an existing type T.
 *
 * - All keys in T are required.
 * - Optionality and nullability are retained.
 * - Default values are retained for non-optional keys.
 * - Allows ZodEffects (e.g. `.transform()`, `.refine()`).
 *
 * > - Use this type for more complex zod-related type checks.
 * > - For simple `satisfies` checks, use {@link ZodSchemaWithShape}.
 */
export type ZodObjectWithShape<T extends Record<string, unknown>> = ZodObject<ZodShape<T>>;

type ZodShape<T extends Record<string, unknown>> = {
  [Key in keyof T]-?: FlexibleZodTypeWrapper<HandleOptionalAndNullable<T[Key]>>;
};

type HandleOptionalAndNullable<T> = undefined extends T
  ? null extends T
    ? ZodOptional<ZodNullable<GetZodType<NonNullable<T>>>>
    : ZodOptional<GetZodType<NonNullable<T>>>
  : null extends T
    ? ZodNullable<GetZodType<NonNullable<T>>>
    : T extends NonNullable<unknown>
      ? GetZodType<T>
      : never;

type GetZodType<T> = [T] extends [Record<string, unknown>]
  ? ZodObjectWithShape<T>
  : [T] extends [boolean]
    ? ZodBoolean
    : [T] extends KnownUnionEnums
      ? KnownUnionZodEnum<[T]>
      : [T] extends [Array<infer U>]
        ? ZodArray<HandleOptionalAndNullable<U>>
        : ZodType<T>;

/**
 * This type reflects known unions that can be used with ZodEnum. This approach to enum/ZodEnum
 * typing is necessary due to TS limitations in regard to deriving a tuple-type from a union.
 */
type KnownUnionEnums =
  | [SubscriptionPriceName]
  | [SubscriptionStatus]
  | [WorkOrderCategory]
  | [WorkOrderPriority]
  | [WorkOrderStatus];

type KnownUnionZodEnum<T extends KnownUnionEnums> = T extends [SubscriptionPriceName]
  ? ZodEnum<Writable<typeof SUB_ENUMS.PRICE_NAMES>>
  : T extends [SubscriptionStatus]
    ? ZodEnum<Writable<typeof SUB_ENUMS.STATUSES>>
    : T extends [WorkOrderCategory]
      ? ZodEnum<Writable<typeof WO_ENUMS.CATEGORIES>>
      : T extends [WorkOrderPriority]
        ? ZodEnum<Writable<typeof WO_ENUMS.PRIORITIES>>
        : T extends [WorkOrderStatus]
          ? ZodEnum<Writable<typeof WO_ENUMS.STATUSES>>
          : never;

type FlexibleZodTypeWrapper<T extends ZodTypeAny> =
  | T
  | ZodTypeWithPossibleEffects<ZodTypeWithPossibleDefault<T>>;

type ZodTypeWithPossibleDefault<T extends ZodTypeAny> = T | ZodDefault<T>;

type ZodTypeWithPossibleEffects<T extends ZodTypeAny> =
  T extends ZodEnum<[string, ...string[]]>
    ? ZodEnumWithPossibleEffects<T>
    : T | ZodEffects<T> | ZodEffects<ZodEffects<T>> | ZodEffects<ZodEffects<ZodEffects<T>>>;

type ZodEnumWithPossibleEffects<T extends ZodEnum<[string, ...string[]]>> =
  | T
  | ZodEffects<T, string, T["options"][number]>
  | ZodEffects<ZodEffects<T, string, T["options"][number]>, string, T["options"][number]>
  | ZodEffects<
      ZodEffects<ZodEffects<T, string, T["options"][number]>, string, T["options"][number]>,
      string,
      T["options"][number]
    >;
