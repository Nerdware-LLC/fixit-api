import type { ConditionalPick, ConditionalExcept, Simplify } from "type-fest";
import type {
  ModelSchemaType,
  BaseAttributeConfigProperties,
  ModelSchemaNestedMap,
  ModelSchemaNestedArray,
} from "./schemaTypes";

/** Internal type defining `Opts` type param of item-type generics. */
type ItemTypeOptsParam = {
  /** Whether to use attribute `alias` values for item keys rather than attribute names. */
  aliasKeys?: boolean;
  /** Whether to set item properties to optional if a `default` is provided. */
  optionalIfDefault?: boolean;
  /** Whether to add `null` to optional properties (i.e., convert `{ foo?: string }` to `{ foo?: string | null }`). */
  nullableIfOptional?: boolean;
};

/**
 * This generic creates an Item type from a DdbSingleTable Model schema.
 * If no `Opts` type param is provided, this generic's default behavior matches
 * that of `ItemOutputType` (`aliasKeys: true` and `optionalIfDefault: false`).
 *
 * @see {@link ItemOutputType} for examples of the default `ItemTypeFromSchema` type behavior.
 * @see {@link ItemInputType} for examples where attributes with a `default` are optional.
 * @see {@link DynamoDbItemType} for examples with attribute names instead of `alias` keys.
 */
export type ItemTypeFromSchema<
  T extends ModelSchemaType,
  Opts extends ItemTypeOptsParam = {
    aliasKeys: true;
    optionalIfDefault: false;
    nullableIfOptional: true;
  },
  NestDepth extends SchemaNestDepth = 0
> = Simplify<
  Iterate<NestDepth> extends 5
    ? never
    : T extends Record<string, BaseAttributeConfigProperties>
    ? GetMappedItemWithAccessMods<T, Opts, NestDepth>
    : T extends Array<BaseAttributeConfigProperties>
    ? GetAttributeType<T[number], Opts, Iterate<NestDepth>>
    : never
>;

/**
 * This generic creates an Item _**INPUTS**_ type from a DdbSingleTable Model schema.
 * Unlike the outputs-variant of this type, attributes that have a `default` are optional,
 * even if they are `required` in the schema.
 *
 * > - To get a typedef for Item _**OUTPUTS**_, use {@link ItemOutputType}.
 * > - To get a typedef without `alias` keys, use {@link DynamoDbItemType}.
 *
 * ---
 *
 * Usage Example:
 *
 * ```ts
 * // This Model schema yields the UserItem type definition (see below)
 * const userModelSchema = {
 *   pk: { alias: "userID", type: "string", required: true },
 *   sk: { type: "string", required: true, default: () => `#USER_SK#${Date.now()}` },
 *   data: {
 *     alias: "job",
 *     type: "map",
 *     schema: {
 *       fooNestedKey: { alias: "JobTitle", type: "string", required: true }
 *     }
 *   },
 *   favoriteFood: {
 *     type: "enum",
 *     oneOf: ["APPLES", "CAKE", "PIZZA"]
 *   },
 *   hobbies: {
 *     alias: "userHobbies",
 *     type: "array",
 *     schema: [{ type: "string" }]
 *   },
 *   listOfPlaces: {
 *     type: "array",
 *     required: true,
 *     schema: [
 *       {
 *         type: "map",
 *         schema: {
 *           placeName: { type: "string", required: true },
 *           address: { type: "string" }
 *         }
 *       }
 *     ]
 *   }
 * } as const;
 *
 * type UserItem = ItemInputType<typeof userModelSchema>;
 * // Resultant UserItem type is equivalent to the type below
 * type UserItemEquivalent = {
 *   userID: string;
 *   sk?: string | undefined; // <-- Note that sk is optional on input items
 *   job?: {
 *     JobTitle: string;
 *   } | undefined;
 *   favoriteFood?: "APPLES" | "CAKE" | "PIZZA" | undefined;
 *   userHobbies?: Array<string> | undefined;
 *   listOfPlaces: Array<{
 *     placeName: string;
 *     address?: string | undefined;
 *   }>;
 * }
 * ```
 */
export type ItemInputType<
  T extends ModelSchemaType,
  NestDepth extends SchemaNestDepth = 0
> = ItemTypeFromSchema<
  T,
  { aliasKeys: true; optionalIfDefault: true; nullableIfOptional: true },
  NestDepth
>;

/**
 * This generic creates an Item _**OUTPUTS**_ type from a DdbSingleTable Model schema.
 * Unlike the inputs-variant of this type, attributes that are marked `required` in the
 * schema are not optional in the typedef, regardless of whether a `default` is provided.
 *
 * > - To get a typedef for Item _**INPUTS**_, use {@link ItemInputType}.
 * > - To get a typedef without `alias` keys, use {@link DynamoDbItemType}.
 *
 * ---
 *
 * Usage Example:
 *
 * ```ts
 * // This Model schema yields the UserItem type definition (see below)
 * const userModelSchema = {
 *   pk: { alias: "userID", type: "string", required: true },
 *   sk: { type: "string", required: true, default: () => `#USER_SK#${Date.now()}` },
 *   data: {
 *     alias: "job",
 *     type: "map",
 *     schema: {
 *       fooNestedKey: { alias: "JobTitle", type: "string", required: true }
 *     }
 *   },
 *   favoriteFood: {
 *     type: "enum",
 *     oneOf: ["APPLES", "CAKE", "PIZZA"]
 *   },
 *   hobbies: {
 *     alias: "userHobbies",
 *     type: "array",
 *     schema: [{ type: "string" }]
 *   },
 *   listOfPlaces: {
 *     type: "array",
 *     required: true,
 *     schema: [
 *       {
 *         type: "map",
 *         schema: {
 *           placeName: { type: "string", required: true },
 *           address: { type: "string" }
 *         }
 *       }
 *     ]
 *   }
 * } as const;
 *
 * type UserItem = ItemOutputType<typeof userModelSchema>;
 * // Resultant UserItem type is equivalent to the type below
 * type UserItemEquivalent = {
 *   userID: string;
 *   sk: string; // <-- Note that sk is required/present on outputted items
 *   job?: {
 *     JobTitle: string;
 *   } | undefined;
 *   favoriteFood?: "APPLES" | "CAKE" | "PIZZA" | undefined;
 *   userHobbies?: Array<string> | undefined;
 *   listOfPlaces: Array<{
 *     placeName: string;
 *     address?: string | undefined;
 *   }>;
 * }
 * ```
 */
export type ItemOutputType<
  T extends ModelSchemaType,
  NestDepth extends SchemaNestDepth = 0
> = ItemTypeFromSchema<
  T,
  { aliasKeys: true; optionalIfDefault: false; nullableIfOptional: true },
  NestDepth
>;

/**
 * This generic creates an internal Item type definition from a DdbSingleTable Model schema.
 * > To get a type def with "alias" keys, use `AliasedItemTypeFromSchema`.
 *
 * ---
 *
 * Usage Example:
 *
 * ```ts
 * // This Model schema yields the UserItem type definition (see below)
 * const userModelSchema = {
 *   pk: { alias: "userID", type: "string", required: true },
 *   sk: { type: "string", required: true, default: () => `#USER_SK#${Date.now()}` },
 *   data: {
 *     alias: "job",
 *     type: "map",
 *     schema: {
 *       fooNestedKey: { alias: "JobTitle", type: "string", required: true }
 *     }
 *   },
 *   favoriteFood: {
 *     type: "enum",
 *     oneOf: ["APPLES", "CAKE", "PIZZA"]
 *   },
 *   hobbies: {
 *     alias: "userHobbies",
 *     type: "array",
 *     schema: [{ type: "string" }]
 *   },
 *   listOfPlaces: {
 *     type: "array",
 *     required: true,
 *     schema: [
 *       {
 *         type: "map",
 *         schema: {
 *           placeName: { type: "string", required: true },
 *           address: { type: "string" }
 *         }
 *       }
 *     ]
 *   }
 * } as const;
 *
 * type UserItem = DynamoDbItemTypeFromSchema<typeof userModelSchema>;
 * // Resultant UserItem type is equivalent to the type below
 * type UserItemEquivalent = {
 *   pk: string;
 *   sk?: string | undefined;
 *   data?: {
 *     fooNestedKey: string;
 *   } | undefined;
 *   favoriteFood?: "APPLES" | "CAKE" | "PIZZA" | undefined;
 *   hobbies?: Array<string> | undefined;
 *   listOfPlaces: Array<{
 *     placeName: string;
 *     address?: string | undefined;
 *   }>;
 * }
 * ```
 */
export type DynamoDbItemType<
  T extends ModelSchemaType,
  NestDepth extends SchemaNestDepth = 0
> = ItemTypeFromSchema<
  T,
  { aliasKeys: false; optionalIfDefault: false; nullableIfOptional: true },
  NestDepth
>;

/**
 * This type maps Item keys to values and makes the following access modifications:
 * - Removes readonly
 * - Adds/removes optionality "?" based on `Opts` type param and attribute configs
 */
type GetMappedItemWithAccessMods<
  T extends Record<string, BaseAttributeConfigProperties>,
  Opts extends ItemTypeOptsParam,
  NestDepth extends SchemaNestDepth
> = {
  -readonly [K in keyof T as GetKey<T, K, Opts>]+?: Opts["nullableIfOptional"] extends true
    ? GetAttributeType<T[K], Opts, NestDepth> | null
    : GetAttributeType<T[K], Opts, NestDepth>;
} & {
    // prettier-ignore
    -readonly [K in keyof GetRequiredKeys<T, Opts> as GetKey<T, K, Opts>]-?: GetAttributeType<T[K], Opts, NestDepth>;
  };

/** Returns "alias" if Opts.aliasKeys is true AND an alias exists, else key. */
type GetKey<
  T extends Record<string, BaseAttributeConfigProperties>,
  K extends keyof T,
  Opts extends { aliasKeys?: boolean } = { aliasKeys: false }
> = Opts["aliasKeys"] extends true ? (T[K]["alias"] extends string ? T[K]["alias"] : K) : K;

/**
 * Picks required keys from Item `<T>`. If `Opts.optionalIfDefault` is true, then
 * all properties that specify a `default` are also optional.
 */
type GetRequiredKeys<
  T extends Record<string, BaseAttributeConfigProperties>,
  Opts extends { optionalIfDefault?: boolean }
> = Opts["optionalIfDefault"] extends true
  ? ConditionalExcept<ConditionalPick<T, { required: true }>, { default: {} }>
  : ConditionalPick<T, { required: true }>;

/**
 * This generic gets the type from an individual attribute config from a Model schema.
 * > String literal types ftw!
 */
type GetAttributeType<
  T extends BaseAttributeConfigProperties,
  Opts extends ItemTypeOptsParam,
  NestDepth extends SchemaNestDepth
> = Iterate<NestDepth> extends 5
  ? never
  : T["type"] extends "string"
  ? string
  : T["type"] extends "number"
  ? number
  : T["type"] extends "boolean"
  ? boolean
  : T["type"] extends "Buffer"
  ? Buffer
  : T["type"] extends "Date"
  ? Date
  : T extends { type: "map"; schema: ModelSchemaNestedMap }
  ? ItemTypeFromSchema<T["schema"], Opts, Iterate<NestDepth>>
  : T extends { type: "array"; schema: ModelSchemaNestedArray }
  ? Array<GetAttributeType<T["schema"][number], Opts, Iterate<NestDepth>>>
  : T extends { type: "enum"; oneOf: ReadonlyArray<string> }
  ? T["oneOf"][number]
  : never;

type SchemaNestDepth = 0 | 1 | 2 | 3 | 4 | 5;

// prettier-ignore
type Iterate<NestDepth extends SchemaNestDepth = 0> =
  NestDepth extends 0
    ? 1
    : NestDepth extends 1
    ? 2
    : NestDepth extends 2
    ? 3
    : NestDepth extends 3
    ? 4
    : NestDepth extends 4
    ? 5
    : 5;

/** `T => T | Partial<T>` */
export type MaybePartialItem<T> = T | Partial<T>;
/** `T => T | Partial<T> | Array<T> | Array<Partial<T>>` */
export type OneOrMoreMaybePartialItems<T> = MaybePartialItem<T> | Array<MaybePartialItem<T>>;

export type AscertainTypeFromOneOrMoreMaybePartialItems<
  ItemParam,
  ItemType,
  ItemTypeToReturn = ItemType
> = ItemParam extends Array<infer BatchItem>
  ? BatchItem extends ItemType
    ? Array<ItemTypeToReturn>
    : BatchItem extends Partial<ItemType>
    ? Array<Partial<ItemTypeToReturn>>
    : never
  : ItemParam extends ItemType
  ? ItemTypeToReturn
  : ItemParam extends Partial<ItemType>
  ? Partial<ItemTypeToReturn>
  : never;
