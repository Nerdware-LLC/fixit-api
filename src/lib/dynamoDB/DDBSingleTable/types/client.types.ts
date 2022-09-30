import type { TableKeysSchemaType, ModelSchemaType } from "./schema.types";
import { GetMappedItemWithAccessMods } from "./item.types";

// DDBSingleTableClient instance property generics:

export type ClientInstanceTableKeys<TableKeysSchema extends TableKeysSchemaType> = {
  hashKey: TableHashKey<TableKeysSchema>[keyof TableHashKey<TableKeysSchema>];
  rangeKey: TableRangeKey<TableKeysSchema>[keyof TableRangeKey<TableKeysSchema>];
};

// DDBSingleTableClient method parameter generics:

export type TableHashKey<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof PickMatching<Schema, { isHashKey: true }>]: string;
};

export type TableRangeKey<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof PickMatching<Schema, { isHashKey: true }>]: string;
};

export type ItemPrimaryKeys<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof GetKeyAttributes<Schema>]: string;
};

export type AliasedItemPrimaryKeys<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof GetKeyAttributes<Schema> as GetKeyAttributes<Schema>[K]["alias"] extends string
    ? GetKeyAttributes<Schema>[K]["alias"]
    : K]: string;
};

export type ItemNonKeyAttributes<Schema extends ModelSchemaType> = GetMappedItemWithAccessMods<
  PickNonMatching<Schema, { isHashKey: true } | { isRangeKey: true }>
>;

type GetKeyAttributes<Schema extends ModelSchemaType> = PickMatching<
  Schema,
  { isHashKey: true } | { isRangeKey: true }
>;

/**
 * This generic provides type definitions for the DynamoDB "opts" parameters used
 * in DDBSingleTableClient methods. It takes a DDB client command class `<C>`,
 * and returns it's lone constructor parameter - an object - with certain fields
 * ommitted. The list of ommitted fields includes all parameters identified as
 * "legacy parameters" in the DynamoDB API documentation, as well as any parameters
 * which are either provided by DDBSingleTableClient instances (like "TableName"),
 * or moved to the method's first positional parameter (like "Key").
 */
export type DDBSingleTableCommandParameters<C extends abstract new (...args: any) => any> = Expand<
  Omit<
    ConstructorParameters<C>[0],
    | "TableName" //            Handled by DDBSingleTableClient methods
    | "Key" //                  Handled by DDBSingleTableClient methods
    | "Item" //                 Handled by DDBSingleTableClient methods
    | "RequestItems" //         Handled by DDBSingleTableClient methods
    | "AttributesToGet" //      Legacy param: instead use ProjectionExpression
    | "AttributeUpdates" //     Legacy param: instead use UpdateExpression
    | "ConditionalOperator" //  Legacy param: instead use ConditionExpression (for Query/Scan, instead use FilterExpression)
    | "Expected" //             Legacy param: instead use ConditionExpression
    | "KeyConditions" //        Legacy param: instead use KeyConditionExpression
    | "QueryFilter" //          Legacy param: instead use FilterExpression
    | "ScanFilter" //           Legacy param: instead use FilterExpression
  >
>;
