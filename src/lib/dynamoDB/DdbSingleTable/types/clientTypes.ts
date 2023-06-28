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
import type { Simplify } from "type-fest";
import type { GenerateKeyConditionExpressionArgs } from "../generateKeyConditionExpression";
import type { GenerateUpdateExpressionOpts } from "../generateUpdateExpression";

/**
 * This generic provides type definitions for the DynamoDB-client parameters used
 * in `DdbSingleTableClient` methods. It takes a DDB client command class `<C>`,
 * and returns it's lone constructor parameter - an object - with certain fields
 * ommitted. The list of ommitted fields includes all deprecated/legacy parameters
 * (as designated by the DynamoDB API documentation), as well as any parameters
 * which are provided by `DdbSingleTableClient` instances (like "TableName"), or
 * moved to the method's first positional parameter (like "Key").
 */
type DdbSTCommandParams<C extends abstract new (...args: any) => any> = Simplify<
  Omit<
    ConstructorParameters<C>[0],
    | "TableName" //            Handled by DdbSingleTableClient methods
    | "Key" //                  Handled by DdbSingleTableClient methods
    | "Item" //                 Handled by DdbSingleTableClient methods
    | "RequestItems" //         Handled by DdbSingleTableClient methods
    | "AttributesToGet" //      Legacy param: instead use ProjectionExpression
    | "AttributeUpdates" //     Legacy param: instead use UpdateExpression
    | "ConditionalOperator" //  Legacy param: instead use ConditionExpression (for Query/Scan, instead use FilterExpression)
    | "Expected" //             Legacy param: instead use ConditionExpression
    | "KeyConditions" //        Legacy param: instead use KeyConditionExpression
    | "QueryFilter" //          Legacy param: instead use FilterExpression
    | "ScanFilter" //           Legacy param: instead use FilterExpression
  >
>;

// DDB COMMAND PARAM TYPES:

type GetCommandParameters = DdbSTCommandParams<typeof GetCommand>;
type BatchGetCommandParameters = DdbSTCommandParams<typeof BatchGetCommand>;
type PutCommandParameters = DdbSTCommandParams<typeof PutCommand>;
type UpdateCommandParameters = DdbSTCommandParams<typeof UpdateCommand>;
type DeleteCommandParameters = DdbSTCommandParams<typeof DeleteCommand>;
type BatchWriteCommandParameters = DdbSTCommandParams<typeof BatchWriteCommand>;
type QueryCommandParameters = DdbSTCommandParams<typeof QueryCommand>;
type ScanCommandParameters = DdbSTCommandParams<typeof ScanCommand>;
type CreateTableCommandParameters = DdbSTCommandParams<typeof CreateTableCommand>;

// CLIENT/MODEL CRUD METHOD PARAM TYPES:

export type GetItemOpts = GetCommandParameters;
export type BatchGetItemsOpts = BatchGetCommandParameters;
export type CreateItemOpts = Omit<PutCommandParameters, "ConditionExpression">;
export type UpsertItemOpts = PutCommandParameters;
export type BatchUpsertItemsOpts = BatchWriteCommandParameters;
export type UpdateItemOpts = UpdateCommandParameters & {
  autogenUpdateExpressionOpts?: GenerateUpdateExpressionOpts;
};
export type DeleteItemOpts = DeleteCommandParameters;
export type BatchDeleteItemsOpts = BatchWriteCommandParameters;
export type BatchUpsertAndDeleteItemsOpts = BatchWriteCommandParameters;
export type QueryOpts<ItemType extends Record<string, unknown> = Record<string, unknown>> =
  QueryCommandParameters &
    Partial<GenerateKeyConditionExpressionArgs<ItemType>> & {
      limit?: QueryCommandParameters["Limit"];
    };
export type ScanOpts = ScanCommandParameters;
export type CreateTableOpts = CreateTableCommandParameters;

// OTHER CLIENT PARAM TYPES:

interface CmdParamWithProjectionExpression {
  ProjectionExpression?: string | undefined;
}

export type PartialItemIfProjectionExpression<
  CmdParams extends CmdParamWithProjectionExpression | undefined,
  ItemType
> = CmdParams extends Required<CmdParamWithProjectionExpression> ? Partial<ItemType> : ItemType;

export type ExpressionAttributeNames = Record<string, string>;
export type ExpressionAttributeValues = Record<string, unknown>;
export interface ExpressionAttributeDicts {
  ExpressionAttributeNames: ExpressionAttributeNames;
  ExpressionAttributeValues: ExpressionAttributeValues;
}
