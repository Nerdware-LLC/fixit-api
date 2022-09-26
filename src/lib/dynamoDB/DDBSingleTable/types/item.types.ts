import type {
  ModelSchemaType,
  ModelSchemaAttributeConfig,
  ModelSchemaNestedAttributes,
  ModelSchemaNestedMap,
  ModelSchemaNestedArray,
  ModelSchemaNestedAttributeConfig
} from "./schema.types";

/**
 * `ItemTypes` yields a union of Item types defined by the Model schema that's
 * provided as the type parameter. This union does not permit Item subsets; the
 * resultant union includes two types:
 * - Items with keys which match schema attribute names
 * - Items with keys which match attribute aliases
 */
export type ItemTypes<Schema extends ModelSchemaType> =
  | ItemTypeFromSchema<Schema>
  | AliasedItemTypeFromSchema<Schema>;

/**
 * `ItemOrPartialItemTypes` yields a union of Item types defined by the Model
 * schema that's provided as the type parameter. This type includes Partial
 * types to allow for arbitrary subsets of Item properties; the resultant union
 * includes four types:
 * - Items with keys which match schema attribute names
 * - Items with keys which match attribute aliases
 * - Items with keys which match _a subset_ of schema attribute names
 * - Items with keys which match _a subset_ of attribute aliases
 */
export type ItemOrPartialItemTypes<Schema extends ModelSchemaType> =
  | ItemTypes<Schema>
  | Partial<ItemTypes<Schema>>;

/**
 * `ItemReturnTypes` provides the return type for functions which include in their
 * parameters either an Item, partial Item, array of Items, or array of partial Items.
 * // TODO expand this description
 */
export type ItemReturnTypes<
  Schema extends ModelSchemaType,
  ItemParam extends AnyItemOrBatchItemsTypes<Schema>
> = ItemParam extends Array<infer I extends ItemTypes<Schema> | Partial<ItemTypes<Schema>>>
  ? Array<ItemReturnTypes<Schema, I>>
  : ItemParam extends ItemTypeFromSchema<Schema>
  ? AliasedItemTypeFromSchema<Schema>
  : ItemParam extends AliasedItemTypeFromSchema<Schema>
  ? ItemTypeFromSchema<Schema>
  : ItemParam extends Partial<ItemTypeFromSchema<Schema>>
  ? Partial<AliasedItemTypeFromSchema<Schema>>
  : ItemParam extends Partial<AliasedItemTypeFromSchema<Schema>>
  ? Partial<ItemTypeFromSchema<Schema>>
  : never;

type AnyItemOrBatchItemsTypes<Schema extends ModelSchemaType> =
  | ItemTypes<Schema>
  | Partial<ItemTypes<Schema>>
  | Array<ItemTypes<Schema>>
  | Array<Partial<ItemTypes<Schema>>>;

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
export type ItemTypeFromSchema<T extends ModelSchemaType | ModelSchemaNestedAttributes> =
  T extends Record<string, ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
    ? WriteableR<
        // prettier-ignore
        Intersection<
            { [K in keyof PickMatching<T, { required: true }>]-?: GetTypeFromAttributeConfig<T[K]> },
            { [K in keyof PickNonMatching<T, { required: true }>]+?: GetTypeFromAttributeConfig<T[K]> }
          >
      >
    : T extends Array<ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
    ? GetTypeFromAttributeConfig<T[number]>
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
export type AliasedItemTypeFromSchema<T extends ModelSchemaType | ModelSchemaNestedAttributes> =
  T extends Record<string, ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
    ? WriteableR<
        // prettier-ignore
        Intersection<
          { [K in keyof PickMatching<T, { required: true }> as TryAlias<T, K>]-?: GetTypeFromAttributeConfig<T[K]> },
          { [K in keyof PickNonMatching<T, { required: true }> as TryAlias<T, K>]+?: GetTypeFromAttributeConfig<T[K]> }
        >
      >
    : T extends Array<ModelSchemaAttributeConfig | ModelSchemaNestedAttributeConfig>
    ? GetTypeFromAttributeConfig<T[number], { aliasKeys: true }>
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
  Opts extends { aliasKeys?: boolean } = { aliasKeys: false }
> = T["type"] extends "string"
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
    ? AliasedItemTypeFromSchema<T["schema"]>
    : ItemTypeFromSchema<T["schema"]>
  : T extends { type: "array"; schema: ModelSchemaNestedArray }
  ? Array<GetTypeFromAttributeConfig<T["schema"][number], Opts>>
  : never;
