import type { ConditionalPick } from "type-fest";
import type { TableKeysSchemaType, ModelSchemaType } from "./schemaTypes";

export type AliasedItemPrimaryKeys<
  Schema extends TableKeysSchemaType | ModelSchemaType,
  KeyAttributesSchema extends GetKeyAttributes<Schema> = GetKeyAttributes<Schema>
> = {
  // This map will set RangeKey to optional if configured with a default
  -readonly [K in keyof KeyAttributesSchema as KeyAttributesSchema[K] extends { isRangeKey: true }
    ? KeyAttributesSchema[K]["default"] extends {}
      ? GetAliasOrAttrName<KeyAttributesSchema, K>
      : never
    : never]+?: string;
} & {
  // Required - filter out RangeKey if configured with a default
  -readonly [K in keyof KeyAttributesSchema as KeyAttributesSchema[K] extends { isRangeKey: true }
    ? KeyAttributesSchema[K]["default"] extends {}
      ? never
      : GetAliasOrAttrName<KeyAttributesSchema, K>
    : GetAliasOrAttrName<KeyAttributesSchema, K>]-?: string;
};

export type GetKeyAttributes<Schema extends TableKeysSchemaType | ModelSchemaType> =
  ConditionalPick<Schema, { isHashKey: true } | { isRangeKey: true }>;

export type GetAliasOrAttrName<
  Schema extends TableKeysSchemaType | ModelSchemaType,
  AttrName extends keyof Schema
> = Schema[AttrName]["alias"] extends string ? Schema[AttrName]["alias"] : AttrName;
