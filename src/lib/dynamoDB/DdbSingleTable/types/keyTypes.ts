import type { ConditionalPick } from "type-fest";
import type { TableKeysSchemaType, ModelSchemaType } from "./schemaTypes";

export type ItemPrimaryKeys<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof GetKeyAttributes<Schema>]: string;
};

export type AliasedItemPrimaryKeys<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof GetKeyAttributes<Schema> as GetKeyAttributes<Schema>[K]["alias"] extends string
    ? GetKeyAttributes<Schema>[K]["alias"]
    : K]: string;
};

export type GetKeyAttributes<Schema extends TableKeysSchemaType | ModelSchemaType> =
  ConditionalPick<Schema, { isHashKey: true } | { isRangeKey: true }>;
