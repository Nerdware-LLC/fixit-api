import type {
  ModelSchemaType,
  ModelSchemaAttributeConfig,
  ModelSchemaNestedAttributes,
  ModelSchemaNestedMap,
  ModelSchemaNestedArray,
  ModelSchemaNestedAttributeConfig
} from "./schema.types";

/**
 * `ItemOrAliasedItem` yields a union of Item types defined by the Model
 * schema that's provided as the type parameter. This union does not permit
 * Item subsets; the resultant union includes two types:
 * - Item with keys which match schema attribute names
 * - Item with keys which match attribute aliases
 */
export type ItemOrAliasedItem<Schema extends ModelSchemaType> =
  | ItemTypeFromSchema<Schema>
  | AliasedItemTypeFromSchema<Schema>;

/**
 * `ItemOrPartialItem`
 *
 * This is used as the fn-param type for most of the Model's Database
 * IO Hook Actions.
 */
export type ItemOrPartialItem<Schema extends ModelSchemaType> =
  | ItemTypeFromSchema<Schema>
  | Partial<ItemTypeFromSchema<Schema>>;

/**
 * `AliasedItemOrPartialAliasedItem` includes
 *
 * - Aliased Item
 * - Parital Aliased Item
 */
export type AliasedItemOrPartialAliasedItem<Schema extends ModelSchemaType> =
  | AliasedItemTypeFromSchema<Schema>
  | Partial<AliasedItemTypeFromSchema<Schema>>;

/**
 * `AnyItemType` includes
 *
 * - Item
 * - Aliased Item
 * - Partial Item
 * - Partial Aliased Item
 */
export type AnySingleItemType<Schema extends ModelSchemaType> =
  | ItemOrAliasedItem<Schema>
  | Partial<ItemOrAliasedItem<Schema>>;

/**
 * `AnyItemType` includes
 *
 * - Array of Items
 * - Array of Aliased Items
 * - Array of Partial Items
 * - Array of Partial Aliased Items
 */
export type AnyBatchItemsType<Schema extends ModelSchemaType> = Array<AnySingleItemType<Schema>>;

/**
 * `AnyItemOrBatchItemsType` includes
 *
 * - Item
 * - Aliased Item
 * - Partial Item
 * - Partial Aliased Item
 * - Array of Items
 * - Array of Aliased Items
 * - Array of Partial Items
 * - Array of Partial Aliased Items
 */
export type AnyItemOrBatchItemsType<Schema extends ModelSchemaType> =
  | AnySingleItemType<Schema>
  | AnyBatchItemsType<Schema>;

// prettier-ignore
/**
 * `ReturnFromItemAliasing` provides the return type for functions which include in their
 * parameters either an Item, partial Item, array of Items, or array of partial Items.
 * // TODO expand this description
 */
export type ReturnFromItemAliasing<
  Schema extends ModelSchemaType,
  Item extends AnySingleItemType<Schema>
> = Item extends ItemTypeFromSchema<Schema>
  ? AliasedItemTypeFromSchema<Schema>
  : Item extends AliasedItemTypeFromSchema<Schema>
  ? ItemTypeFromSchema<Schema>
  : Item extends Partial<ItemTypeFromSchema<Schema>>
  ? Partial<AliasedItemTypeFromSchema<Schema>>
  : Item extends Partial<AliasedItemTypeFromSchema<Schema>>
  ? Partial<ItemTypeFromSchema<Schema>>
  : never;

/**
 * For use in the `Model.aliasMapping()` private method.
 */
export type AliasMappingItemKey<
  Schema extends ModelSchemaType, // <-- can be Model.schema OR Model.aliasedSchema
  Item extends AnySingleItemType<Schema>
> = keyof ReturnFromItemAliasing<Schema, Item>;

/**
 * For use in the `Model.aliasMapping()` private method.
 */
export type AliasMappingItemValue<
  Schema extends ModelSchemaType, // <-- can be Model.schema OR Model.aliasedSchema
  Item extends AnySingleItemType<Schema>
> = ReturnFromItemAliasing<Schema, Item>[keyof ReturnFromItemAliasing<Schema, Item>];

export type ReturnFromIOHookActionsSet<
  Schema extends ModelSchemaType,
  ItemParam extends AnyItemOrBatchItemsType<Schema>
> = ItemParam extends Array<infer I extends AnySingleItemType<Schema>>
  ? Array<ReturnFromIOHookActionsSet<Schema, I>>
  : ItemParam extends ItemTypeFromSchema<Schema>
  ? AliasedItemTypeFromSchema<Schema>
  : ItemParam extends AliasedItemTypeFromSchema<Schema>
  ? ItemTypeFromSchema<Schema>
  : ItemParam extends Partial<ItemTypeFromSchema<Schema>>
  ? Partial<AliasedItemTypeFromSchema<Schema>>
  : ItemParam extends Partial<AliasedItemTypeFromSchema<Schema>>
  ? Partial<ItemTypeFromSchema<Schema>>
  : never;

/**
 * `ItemTypeFromSchema`
 * - This generic creates a Model Item type definition from a DDBSingleTable Model schema using
 *   attributes' respective "type" and "schema" values.
 * - The resultant Item type definition is stripped of the `readonly` modifiers present in all schema.
 * - To get a type def with "alias" keys, use `AliasedItemTypeFromSchema` (add "Aliased" prefix).
 *
 * ---
 *
 * Usage Example:
 *
 * ```ts
 * // This Model schema yields the UserItem type definition (see below)
 * const userModelSchema = {
 *   pk: { alias: "userID", type: "string", required: true },
 *   sk: { type: "string" },
 *   data: {
 *     alias: "job",
 *     type: "map",
 *     schema: {
 *       fooNestedKey: { alias: "JobTitle", type: "string", required: true }
 *     }
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
 * type UserItem = ItemTypeFromSchema<typeof userModelSchema>;
 * // Resultant UserItem type is equivalent to the type below
 * type UserItemEquivalent = {
 *   pk: string;
 *   sk?: string | undefined;
 *   data?: {
 *     fooNestedKey: string;
 *   } | undefined;
 *   hobbies?: Array<string> | undefined;
 *   listOfPlaces: Array<{
 *     placeName: string;
 *     address?: string | undefined;
 *   }>;
 * }
 * ```
 */
export type ItemTypeFromSchema<
  T extends ModelSchemaType | ModelSchemaNestedAttributes,
  NestDepth extends ModelSchemaNestDepth = 0
> = NestDepth extends 6
  ? never
  : T extends Record<string, ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
  ? WriteableR<
      // prettier-ignore
      Intersection<
        { [K in keyof PickMatching<T, { required: true }>]-?: GetTypeFromAttributeConfig<T[K], NestDepth> },
        { [K in keyof PickNonMatching<T, { required: true }>]+?: GetTypeFromAttributeConfig<T[K], NestDepth> }
      >
    >
  : T extends Array<ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
  ? GetTypeFromAttributeConfig<T[number], NestDepth>
  : never;

/**
 * `AliasedItemTypeFromSchema`
 * - This generic creates a Model Item type definition from a DDBSingleTable Model schema using
 *   attributes' respective "type", "schema", and "alias" values.
 * - The resultant Item type definition is stripped of the `readonly` modifiers present in all schema.
 * - To get a type def without "alias" keys, use `ItemTypeFromSchema` (no "Aliased" prefix).
 *
 * ---
 *
 * Usage Example:
 *
 * ```ts
 * // This Model schema yields the UserItem type definition (see below)
 * const userModelSchema = {
 *   pk: { alias: "userID", type: "string", required: true },
 *   sk: { type: "string" },
 *   data: {
 *     alias: "job",
 *     type: "map",
 *     schema: {
 *       fooNestedKey: { alias: "JobTitle", type: "string", required: true }
 *     }
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
 * type UserItem = AliasedItemTypeFromSchema<typeof userModelSchema>;
 * // Resultant UserItem type is equivalent to the type below
 * type UserItemEquivalent = {
 *   userID: string;
 *   sk?: string | undefined;
 *   job?: {
 *     JobTitle: string;
 *   } | undefined;
 *   userHobbies?: Array<string> | undefined;
 *   listOfPlaces: Array<{
 *     placeName: string;
 *     address?: string | undefined;
 *   }>;
 * }
 * ```
 */
export type AliasedItemTypeFromSchema<
  T extends ModelSchemaType | ModelSchemaNestedAttributes,
  NestDepth extends ModelSchemaNestDepth = 0
> = Iterate<NestDepth> extends 5
  ? never
  : T extends Record<string, ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
  ? WriteableR<
      // prettier-ignore
      Intersection<
        { [K in keyof PickMatching<T, { required: true }> as TryAlias<T, K>]-?: GetTypeFromAttributeConfig<T[K], NestDepth> },
        { [K in keyof PickNonMatching<T, { required: true }> as TryAlias<T, K>]+?: GetTypeFromAttributeConfig<T[K], NestDepth> }
      >
    >
  : T extends Array<ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
  ? GetTypeFromAttributeConfig<T[number], Iterate<NestDepth>, { aliasKeys: true }>
  : never;

/**
 * `TryAlias` returns "alias" if exists, else key.
 */
type TryAlias<
  T extends Record<string, ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>,
  K extends keyof T
> = T[K]["alias"] extends string ? T[K]["alias"] : K;

/**
 * `GetTypeFromAttributeConfig`
 * - This generic gets the type from an individual attribute config from a Model schema.
 * - String literal types ftw!
 *
 * // TODO Add usage example to GetTypeFromAttributeConfig generic.
 */
export type GetTypeFromAttributeConfig<
  T extends ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig,
  NestDepth extends ModelSchemaNestDepth = 0,
  Opts extends { aliasKeys?: boolean } = { aliasKeys: false }
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
  ? Opts["aliasKeys"] extends true
    ? AliasedItemTypeFromSchema<T["schema"], Iterate<NestDepth>>
    : ItemTypeFromSchema<T["schema"], Iterate<NestDepth>>
  : T extends { type: "array"; schema: ModelSchemaNestedArray }
  ? Array<GetTypeFromAttributeConfig<T["schema"][number], Iterate<NestDepth>, Opts>>
  : never;

type ModelSchemaNestDepth = 0 | 1 | 2 | 3 | 4 | 5;

// prettier-ignore
type Iterate<NestDepth extends ModelSchemaNestDepth = 0> =
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
