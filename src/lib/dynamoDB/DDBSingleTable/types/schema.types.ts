/**
 * `ModelSchemaAttributeConfig`
 * - Properties which define an individual Model schema attribute.
 * - For table/index key attributes, instead use "KeyAttributeConfig".
 */
export type ModelSchemaAttributeConfig = Readonly<{
  alias?: string;
  type: "string" | "number" | "boolean" | "Buffer" | "Date" | "map" | "array";
  schema?: ModelSchemaNestedAttributes; // TODO Note in docs that max nest depth = 5 (setting a max solves infinite type recursive instantiation problem)
  isHashKey?: boolean; //  default false
  isRangeKey?: boolean; // default false
  index?: {
    name: string;
    global?: boolean; // default true
    rangeKey?: string;
    project?: boolean | Array<string>; // true = project ALL, false = project KEYS_ONLY, string[] = project listed attributes
    throughput?: { read: number; write: number }; // don't set this when billing mode is PAY_PER_REQUEST
  };
  // Properties used by Model `toDB` and `fromDB` methods, in order of usage:
  default?: unknown; // TODO Have schema attribute "default" type match schema "type".
  transformValue?: {
    toDB?: (inputValue: unknown) => unknown; // <-- Fn to modify value before `validate` fn is called; use for normalization.
    fromDB?: (dbValue: unknown) => unknown; // <-- Fn to modify value returned from DDB client; use to format/prettify values.
  };
  validate?: (value: unknown) => boolean;
  required?: boolean; // default false
}>;

/**
 * `ModelSchema`
 * - Used for the attributes of a Model schema.
 * - Map attribute-name keys to their respective attribute configs.
 * - For attributes of the TableKeys schema, instead use TableKeysSchemaAttributes.
 */
export type ModelSchemaType = Record<string, ModelSchemaAttributeConfig>;

export type ModelSchemaOptions = {
  allowUnknownAttributes?: boolean; // default false
  transformItem?: {
    toDB?: (item: unknown) => unknown; // <-- Fn to modify entire Item before `validate` fn is called
    fromDB?: (item: unknown) => unknown; // <-- Fn to modify entire Item returned from DDB client
  };
  validateItem?: (item: unknown) => boolean;
};

// prettier-ignore
export type AliasedModelSchemaType<Schema extends ModelSchemaType> = {
  [K in keyof Schema as Schema[K]["alias"] extends string
      ? Schema[K]["alias"]
      : K]: Schema[K] & { attributeName: K };
};

/**
 * `ModelSchemaNestedAttributes`
 * - Used for nested "schema" within attributes of Model schema.
 */
export type ModelSchemaNestedAttributes = ModelSchemaNestedMap | ModelSchemaNestedArray;
export type ModelSchemaNestedMap = Readonly<Record<string, ModelSchemaNestedAttributeConfig>>;
export type ModelSchemaNestedArray = Readonly<Array<ModelSchemaNestedAttributeConfig>>;
export type ModelSchemaNestedAttributeConfig = Omit<
  ModelSchemaAttributeConfig,
  "hashKey" | "rangeKey" | "index"
>;

/**
 * `TableKeysSchemaType`
 * - Used for TableKeys schema.
 * - Map the names of key attributes to their respective key attribute configs.
 * - TableKey attribute configs serve as a default for all Models; most Models
 *   will override these defaults in their respective Model schema.
 * - For attributes of a Model schema, instead use ModelSchemaType.
 */
export type TableKeysSchemaType = Record<string, KeyAttributeConfig>;

export type KeyAttributeConfig = Omit<ModelSchemaAttributeConfig, "schema"> &
  Readonly<{
    type: "string" | "number" | "Buffer"; // keys can only be S, N, or B.
    required: true;
  }>;
