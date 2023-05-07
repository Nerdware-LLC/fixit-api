import { GetMappedItemWithAccessMods } from "./itemTypes";
import type { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import type {
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { ConditionalPick, ConditionalExcept, Simplify } from "type-fest";
import type { TableKeysSchemaType, ModelSchemaType } from "./schemaTypes";

// DDBSingleTableClient instance property generics:

export type ClientInstanceTableKeys<TableKeysSchema extends TableKeysSchemaType> = {
  hashKey: TableHashKey<TableKeysSchema>[keyof TableHashKey<TableKeysSchema>];
  rangeKey: TableRangeKey<TableKeysSchema>[keyof TableRangeKey<TableKeysSchema>];
};

// DDBSingleTableClient method parameter generics:

export type TableHashKey<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof ConditionalPick<Schema, { isHashKey: true }>]: string;
};

export type TableRangeKey<Schema extends TableKeysSchemaType | ModelSchemaType> = {
  -readonly [K in keyof ConditionalPick<Schema, { isHashKey: true }>]: string;
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
  ConditionalExcept<Schema, { isHashKey: true } | { isRangeKey: true }>
>;

type GetKeyAttributes<Schema extends ModelSchemaType> = ConditionalPick<
  Schema,
  { isHashKey: true } | { isRangeKey: true }
>;

////////////////////////////////////////////////////////////////////////////////

/**
 * This generic provides type definitions for the DynamoDB "opts" parameters used
 * in DDBSingleTableClient methods. It takes a DDB client command class `<C>`,
 * and returns it's lone constructor parameter - an object - with certain fields
 * ommitted. The list of ommitted fields includes all parameters identified as
 * "legacy parameters" in the DynamoDB API documentation, as well as any parameters
 * which are either provided by DDBSingleTableClient instances (like "TableName"),
 * or moved to the method's first positional parameter (like "Key").
 */
export type DDBSingleTableCommandParameters<C extends abstract new (...args: any) => any> =
  Simplify<
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

export type GetCommandParameters = DDBSingleTableCommandParameters<typeof GetCommand>;
export type BatchGetCommandParameters = DDBSingleTableCommandParameters<typeof BatchGetCommand>;
export type PutCommandParameters = DDBSingleTableCommandParameters<typeof PutCommand>;
export type UpdateCommandParameters = DDBSingleTableCommandParameters<typeof UpdateCommand>;
export type DeleteCommandParameters = DDBSingleTableCommandParameters<typeof DeleteCommand>;
export type BatchWriteCommandParameters = DDBSingleTableCommandParameters<typeof BatchWriteCommand>;
export type QueryCommandParameters = DDBSingleTableCommandParameters<typeof QueryCommand>;
export type ScanCommandParameters = DDBSingleTableCommandParameters<typeof ScanCommand>;
export type CreateTableCommandParameters = DDBSingleTableCommandParameters<typeof CreateTableCommand>; // prettier-ignore

export type GetItemOpts = GetCommandParameters;
export type BatchGetItemsOpts = BatchGetCommandParameters;
export type CreateItemOpts = Omit<PutCommandParameters, "ConditionExpression">;
export type UpsertItemOpts = PutCommandParameters;
export type BatchUpsertItemsOpts = BatchWriteCommandParameters;
export type UpdateItemOpts = UpdateCommandParameters;
export type DeleteItemOpts = DeleteCommandParameters;
export type BatchDeleteItemsOpts = BatchWriteCommandParameters;
export type BatchUpsertAndDeleteItemsOpts = BatchWriteCommandParameters;
export type QueryOpts = QueryCommandParameters;
export type ScanOpts = ScanCommandParameters;
export type CreateTableOpts = CreateTableCommandParameters;
