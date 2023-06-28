import type { SetOptional } from "type-fest";

///////////////////////////////////////////////////////////////////
// ATTRIBUTE CONFIG PROPERTY TYPES:

/** Base attribute config properties common to all attribute types. */
export interface BaseAttributeConfigProperties {
  /**
   * The attribute's name outside of the database (e.g., alias "id" for attribute "pk").
   * During write operations, if the object provided to the Model method contains a key
   * matching a schema-defined `alias` value, the key is replaced with the attribute's
   * name. For both read and write operations, when data is returned from the database,
   * this key-switch occurs in reverse - any object keys which match an attribute with a
   * defined `alias` will be replaced with their respective `alias`. Note that all `alias`
   * values must be unique - the Model's constructor will throw an error if the schema
   * contains any duplicate `alias` values.
   */
  readonly alias?: string;
  /**
   * The attribute's DynamoDB type. Usage notes:
   *
   * - For nested types "map" and "array":
   *   - The shape of the nested object/array can be defined using the attribute's
   *     `schema` property.
   *   - `alias` is not supported for properties which are not top-level attributes.
   *
   * - For type "enum":
   *   - The `oneOf` property must be defined.
   */
  readonly type: "string" | "number" | "boolean" | "Buffer" | "Date" | "map" | "array" | "enum";
  /** Specifies allowed values for attributes of `type: "enum"`. */
  readonly oneOf?: ReadonlyArray<string>;
  /**
   * Optional attribute default value to apply during write operations. If set to a
   * function, it is called with the entire raw item-object provided to the Model
   * method, and the attribute value is set to the function's returned value. With the
   * exception of `updateItem` calls, an attribute's value is set to this `default` if
   * the initial value provided to the Model method is `undefined` or `null`. Note that
   * if a specified `default` is a primitive rather than a function, and the primitive's
   * type does not match the attribute's `type`, the Model's constructor will throw an
   * error. _DdbST does not validate functional `default`s._
   */
  readonly default?:
    | Required<unknown>
    | null
    | ((input: Record<string, unknown>) => Required<unknown> | null);
  /** Methods for transforming the attribute value to/from the DB. */
  readonly transformValue?: {
    /** Fn to modify value before `validate` fn is called; use for normalization. */
    readonly toDB?: (inputValue: any) => Required<unknown> | null;
    /** Fn to modify value returned from DDB client; use to format/prettify values. */
    readonly fromDB?: (dbValue: any) => Required<unknown> | null;
  };
  /**
   * Custom attribute value validation function called for every write operation. The
   * value passed into this function is the "raw" value provided to the Model write
   * method (e.g., `createItem`), with the following schema-defined transformations in
   * order of execution:
   *
   * 1. With the exception of `updateItem` calls, any schema-defined `"default"`
   *    value will have been applied if the initial value is `undefined` or `null`.
   * 2. The `transformValue.toDB` function will have been applied, if defined.
   * 3. With the exception of `updateItem` calls, the `transformItem.toDB` function
   *    will have been applied, if defined.
   *
   * Note: `"enum"` attributes are validated using the array specified in the `oneOf`
   * attribute-config, and therefore do not require a custom `validate` function.
   */
  readonly validate?: (value: any) => boolean;
  /**
   * Optional boolean flag indicating whether a value is required for create-operations.
   * If `true`, an error will be thrown if the attribute value is `undefined` or `null`.
   * Note that this check is performed after all other schema-defined transformations
   * and validations have been applied.
   *
   * - Default: `false` for non-key attributes (keys are always required)
   * - Applies to the following methods:
   *   - `createItem`
   *   - `upsertItem`
   *   - `batchUpsertItems`
   */
  readonly required?: boolean;
}

///////////////////////////////////////////////////////////////////
// ATTRIBUTE CONFIG TYPES:

/** Type for a key attribute config. */
export interface KeyAttributeConfig extends BaseAttributeConfigProperties {
  /** The key attribute's DynamoDB type (keys can only be S, N, or B). */
  readonly type: "string" | "number" | "Buffer";
  /** Is attribute-value required flag (must be `true` for key attributes). */
  readonly required: true;
  /** Indicates the attribute is the table's hash key (default: `false`) */
  readonly isHashKey?: boolean;
  /** Indicates the attribute is the table's range key (default: `false`) */
  readonly isRangeKey?: boolean;
  /** DynamoDB index configs, provided on the index's hash key. */
  readonly index?: {
    /** The index name */
    readonly name: string;
    /** Is global index; pass `false` for local indexes (default: `true`). */
    readonly global?: boolean;
    /** The attribute which will serve as the index's range key, if any. */
    readonly rangeKey?: string;
    /** `true`: project ALL, `false`: project KEYS_ONLY, `string[]`: project listed attributes */
    readonly project?: boolean | Array<string>; //
    /** Don't set this when billing mode is PAY_PER_REQUEST */
    readonly throughput?: { readonly read: number; readonly write: number };
  };
}

/** Type for a non-key attribute config. */
export interface ModelSchemaAttributeConfig extends BaseAttributeConfigProperties {
  /**
   * An attribute's nested schema. This property is only valid for attributes of type
   * `"map"` or `"array"`.
   *
   * For `"map"` attributes, the schema must be an object whose keys are the names of
   * the nested attributes, and whose values are the nested attribute configs. Note that
   * if a descendant attribute config defines a `default` value, that default will only
   * be applied if the parent already exists in the item being processed. For example,
   * to ensure that `myMap.myNestedMap.myNestedString` defaults to `"foo"` even if
   * `myNestedMap` is `null`/`undefined`, the `myNestedMap` attribute config should also
   * define a `default` value of `{}` (en empty object); alternatively, parent defaults
   * can also set child defaults, so `myNestedMap` could itself set the nested `"foo"`
   * property (e.g., `{ myNestedString: "foo" }` instead of `{}`).
   *
   * For `"array"` attributes, the schema must be an array of nested attribute configs.
   * Array schema can define both arrays and tuples:
   * - If the schema is an array with a length of 1, the attribute is treated as an array
   *   of variable length which contains elements of the type defined by the lone nested
   *   attribute config.
   * - If the schema is an array with a length > 1, the attribute is treated as a tuple
   *   of fixed length, where each element in the array is of the type defined by the
   *   attribute config at the corresponding index.
   *
   * > - `schema` is limited to a max nest depth of 5 levels.
   */
  readonly schema?: ModelSchemaNestedAttributes;
}

/** Union of {@link ModelSchemaNestedMap} and {@link ModelSchemaNestedArray}. */
export type ModelSchemaNestedAttributes = ModelSchemaNestedMap | ModelSchemaNestedArray;
/** Type for "schema" defining nested array of attribute values. */
export type ModelSchemaNestedArray = ReadonlyArray<ModelSchemaAttributeConfig>;
/** Type for "schema" defining nested map of attribute values. */
export interface ModelSchemaNestedMap {
  readonly [k: string]: ModelSchemaAttributeConfig;
}

///////////////////////////////////////////////////////////////////
// SCHEMA TYPES:

/**
 * Type for the `TableKeys` schema; for `Model` schemas, instead use {@link ModelSchemaType}.
 */
export interface TableKeysSchemaType {
  readonly [k: string]: KeyAttributeConfig;
}

/**
 * Type for a `Model` schema; for the `TableKeys` schema, instead use {@link TableKeysSchemaType}.
 * All `ModelSchemaType`s are given an index signature to allow for arbitrary attributes
 * to be defined, but the index signature is only used for non-key attributes; key
 * attributes must be explicitly defined and provided in the `TableKeysSchemaType` type
 * param.
 * If the `TableKeysSchemaType` type-param is provided, any key attributes defined within
 * it are made _optional_ in the `ModelSchemaType`; the `"type"` and `"required"` attribute
 * configs are also made optional for key attributes (they're ultimately merged in from
 * the `TableKeysSchema`).
 */
export type ModelSchemaType<TableKeysSchema extends TableKeysSchemaType | undefined = undefined> =
  TableKeysSchema extends TableKeysSchemaType
    ? { readonly [k: string]: ModelSchemaAttributeConfig } & {
        readonly [K in keyof TableKeysSchema]?: SetOptional<
          ModelSchemaAttributeConfig,
          "type" | "required"
        >;
      }
    : { readonly [k: string]: ModelSchemaAttributeConfig };

/**
 * Use this type to derive a _merged_ schema type from merging a
 * `TableKeysSchema` and a `ModelSchema`.
 */
export type MergeModelAndTableKeysSchema<
  TableKeysSchema extends TableKeysSchemaType,
  ModelSchema extends ModelSchemaType<TableKeysSchema>
> = {
  [K in keyof TableKeysSchema | keyof ModelSchema]: K extends keyof TableKeysSchema
    ? TableKeysSchema[K] extends KeyAttributeConfig // <-- K is in TableKeysSchema
      ? K extends keyof ModelSchema
        ? ModelSchema[K] extends SetOptional<ModelSchemaAttributeConfig, "type" | "required">
          ? Omit<TableKeysSchema[K], "isHashKey" | "isRangeKey" | "index"> & ModelSchema[K]
          : never
        : Omit<TableKeysSchema[K], "isHashKey" | "isRangeKey" | "index">
      : never
    : K extends keyof ModelSchema // <-- K is NOT in TableKeysSchema
    ? ModelSchema[K] extends ModelSchemaAttributeConfig
      ? ModelSchema[K]
      : never
    : never; // <-- K must be in either TableKeysSchema or ModelSchema
};

/** Model config options to define item-level transformations and validations. */
export interface ModelSchemaOptions {
  /** Whether the Model allows unknown attributes on create/upsert operations (default: `false`). */
  readonly allowUnknownAttributes?: boolean;
  /** Item-level transformations to/from the DB. */
  readonly transformItem?: {
    /** Fn to modify entire Item before `validate` fn is called. */
    readonly toDB?: (item: any) => Record<string, unknown>;
    // readonly toDB?: (item: Record<string, unknown>) => Record<string, unknown>;
    /** Fn to modify entire Item returned from DDB client. */
    readonly fromDB?: (item: any) => Record<string, unknown>;
  };
  /** Item-level custom validation function. */
  readonly validateItem?: (item: any) => boolean;
}

///////////////////////////////////////////////////////////////////
// SCHEMA MAPPED UTILITY-TYPES:

/**
 * This is an internal type used by the Model class to define the map of attribute names
 * to aliases.
 *
 * ```ts
 * // Using the `fooSchema` example below results in `fooSchemaAttrsToAliasesMap`:
 * const fooSchema = {
 *   a: { type: "string", alias: "Apple" },
 *   b: { type: "string", alias: "Banana" },
 *   c: { type: "string" },
 *   d: { type: "string" },
 * } as const;
 * // Resultant type:
 * const fooSchemaAttrsToAliasesMap: ModelSchemaAttributesToAliasesMap<typeof fooSchema> = {
 *   a: "Apple",
 *   b: "Banana",
 * };
 * ```
 */
export type ModelSchemaAttributesToAliasesMap<Schema extends ModelSchemaType> = {
  // AttrName --> alias
  [AttrName in keyof Schema as AttrName extends number | symbol
    ? never
    : Schema[AttrName] extends { alias: string }
    ? AttrName
    : never]: Schema[AttrName]["alias"] extends string ? Schema[AttrName]["alias"] : never;
};

/**
 * This is an internal type used by the Model class to define the map of aliases to
 * attribute names.
 *
 * ```ts
 * // Using the `fooSchema` example below results in `fooSchemaAliasesToAttrsMap`:
 * const fooSchema = {
 *   a: { type: "string", alias: "Apple" },
 *   b: { type: "string", alias: "Banana" },
 *   c: { type: "string" },
 *   d: { type: "string" },
 * } as const;
 * // Resultant type:
 * const fooSchemaAliasesToAttrsMap: ModelSchemaAliasesToAttributesMap<typeof fooSchema> = {
 *   Apple: "a",
 *   Banana: "b",
 * };
 * ```
 */
export type ModelSchemaAliasesToAttributesMap<Schema extends ModelSchemaType> = {
  // alias --> AttrName
  [AttrName in keyof Schema as AttrName extends number | symbol
    ? never
    : Schema[AttrName] extends { alias: string }
    ? Schema[AttrName]["alias"]
    : never]: AttrName extends string ? AttrName : never;
};