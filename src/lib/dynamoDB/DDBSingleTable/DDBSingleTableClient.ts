import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  ListTablesCommand,
  type DynamoDBClientConfig
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  type TranslateConfig
} from "@aws-sdk/lib-dynamodb";
import { generateUpdateExpression } from "./generateUpdateExpression";
import type {
  DDBSingleTableCommandParameters,
  ModelSchemaType,
  ItemTypeFromSchema,
  ItemPrimaryKeys,
  ItemNonKeyAttributes
} from "./types";

/**
 * A DynamoDB CRUD utility for single-table designs. All methods wrap DDB API
 * commands to provide a simplified DDB API interface to consuming modules.
 *
 * **CRUD Methods:**
 *
 * - `getItem()` GetItem command wrapper.
 *
 * - `batchGetItems()` BatchGetItem command wrapper.
 *
 * - `createItem()` An aliased form of the PutItem command which always
 *    includes the ConditionExpression `attribute_not_exists(pk)`.
 *
 * - `upsertItem()` An aliased form of the PutItem command. It can return an
 *    updated Item's old values if `opts.ReturnValues` is set to "ALL_OLD",
 *    otherwise it returns undefined. If not provided, `opts.ReturnValues` is
 *    set to "ALL_OLD".
 *
 * - `batchUpsertItems()` An aliased form of the BatchWriteItem command which
 *    is only used for PutItem operations. Note that BatchWriteItem does not
 *    support condition expressions.
 *
 * - `updateItem()` UpdateItem command wrapper. If an UpdateExpression is not
 *    provided, this method will auto-generate one for you using the provided
 *    item's keys and values to form SET actions. The function which generates
 *    the UpdateExpression also creates a map for ExpressionAttributeValues, so
 *    t this time, providing an EAV arg without an UpdateExpression will result
 *    in an error (e.g., if you provide an EAV for a ConditionExpression without
 *    also providing an UpdateExpression). In the future, however, the auto-gen'd
 *    EAV object may be merged with the caller's EAV, with any existing EAV key
 *    placeholders regex-swapped in the ConditionExpression (if provided).
 *
 * - `deleteItem()` DeleteItem command wrapper.
 *
 * - `batchDeleteItems()` An aliased form of the BatchWriteItem command which
 *    is only used for DeleteItem operations. Note that BatchWriteItem does not
 *    support condition expressions.
 *
 * - `batchUpsertAndDeleteItems()` An aliased form of the BatchWriteItem
 *    command which can be used to execute conditionless PutItem and DeleteItem
 *    operations in the same call. Note that while each individual underlying
 *    command operation is atomic (PutItem and DeleteItem), they're not atomic
 *    as a a whole, despite occurring within the same call.
 *
 * - `query()` Query command wrapper.
 *
 * - `scan()` Scan command wrapper.
 *
 * **Utility Methods:**
 *
 * - `describeTable()` DescribeTable command wrapper.
 *
 * - `createTable()` CreateTable command wrapper.
 *
 * - `listTables()` ListTables command wrapper.
 */
export class DDBSingleTableClient {
  // STATIC PROPERTIES
  private static readonly DEFAULTS = {
    marshallOptions: {
      convertEmptyValues: false, // Whether to automatically convert empty strings, blobs, and sets to `null` (false by default).
      removeUndefinedValues: true, // Whether to remove undefined values while marshalling (false by default).
      convertClassInstanceToMap: true // Whether to convert typeof object to map attribute (false by default).
    },
    unmarshallOptions: {
      wrapNumbers: false // Whether to return numbers as a string instead of converting them to native JavaScript numbers (false by default).
    }
  };

  // INSTANCE PROPERTIES
  readonly tableName: string;

  // PRIVATE INSTANCE PROPERTIES
  private readonly ddbClient: DynamoDBClient;
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor({
    tableName,
    ddbClientConfigs: {
      marshallOptions = DDBSingleTableClient.DEFAULTS.marshallOptions,
      unmarshallOptions = DDBSingleTableClient.DEFAULTS.unmarshallOptions,
      ...ddbClientConfigs
    }
  }: {
    tableName: string;
    ddbClientConfigs: Expand<DynamoDBClientConfig & TranslateConfig>;
  }) {
    this.tableName = tableName;

    // Initialize ddbClient and attach proc exit handler which calls destroy method.
    this.ddbClient = new DynamoDBClient(ddbClientConfigs);
    process.on("exit", () => this.ddbClient.destroy());

    // Initialize ddbDocClient
    this.ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient, {
      marshallOptions,
      unmarshallOptions
    });
  }

  // INSTANCE METHODS:

  readonly getItem = async <Schema extends ModelSchemaType>(
    primaryKeys: ItemPrimaryKeys<Schema>,
    getItemOpts: DDBSingleTableCommandParameters<typeof GetCommand> = {}
  ) => {
    const { Item } = await this.ddbDocClient.send(
      new GetCommand({
        ...getItemOpts,
        TableName: this.tableName,
        Key: primaryKeys
      })
    );

    return Item as Partial<ItemTypeFromSchema<Schema>>;
  };

  readonly batchGetItems = async <Schema extends ModelSchemaType>(
    primaryKeys: Array<ItemPrimaryKeys<Schema>>,
    batchGetItemsOpts: DDBSingleTableCommandParameters<typeof BatchGetCommand> = {}
  ) => {
    const result = await this.ddbDocClient.send(
      new BatchGetCommand({
        ...batchGetItemsOpts,
        RequestItems: {
          [this.tableName]: {
            Keys: primaryKeys
          }
        }
      })
    );

    // TODO Add handling to batchGetItems for `result.UnprocessedKeys`
    const { [this.tableName]: items } = result?.Responses ?? {};

    return items as Array<Partial<ItemTypeFromSchema<Schema>>>;
  };

  readonly createItem = async <Schema extends ModelSchemaType>(
    item: ItemTypeFromSchema<Schema>,
    createItemOpts: Expand<
      Omit<DDBSingleTableCommandParameters<typeof PutCommand>, "ConditionExpression">
    > = {}
  ) => {
    await this.ddbDocClient.send(
      new PutCommand({
        ...createItemOpts,
        TableName: this.tableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)"
        /* Note that appending "AND attribute_not_exists(sk)" to the
        above expression would be extraneous, since DDB PutItem first
        looks for an Item with the specified item's keys, and THEN it
        applies the condition expression if it finds one.          */
      })
    );
    /* PutItem ReturnValues can only be NONE or ALL_OLD, so the DDB
    API will never return anything here. */
  };

  readonly upsertItem = async <Schema extends ModelSchemaType>(
    item: Partial<ItemTypeFromSchema<Schema>>,
    upsertItemOpts: DDBSingleTableCommandParameters<typeof PutCommand> = {}
  ) => {
    // Set ReturnValues default to "ALL_OLD"
    const { ReturnValues = "ALL_OLD", ...otherUpsertItemOpts } = upsertItemOpts;

    const { Attributes } = await this.ddbDocClient.send(
      new PutCommand({
        ...otherUpsertItemOpts,
        ReturnValues,
        TableName: this.tableName,
        Item: item
      })
    );

    return Attributes as Partial<ItemTypeFromSchema<Schema>>;
  };

  readonly batchUpsertItems = async <Schema extends ModelSchemaType>(
    items: Array<ItemTypeFromSchema<Schema> | Partial<ItemTypeFromSchema<Schema>>>,
    batchUpsertItemsOpts: DDBSingleTableCommandParameters<typeof BatchWriteCommand> = {}
  ) => {
    // TODO Add handling to batchUpsertItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchUpsertItemsOpts,
        RequestItems: {
          [this.tableName]: items.map((item) => ({ PutRequest: { Item: item } }))
        }
      })
    );
  };

  readonly updateItem = async <Schema extends ModelSchemaType>(
    primaryKeys: ItemPrimaryKeys<Schema>,
    attributesToUpdate: Partial<ItemNonKeyAttributes<Schema>>,
    updateItemOpts: DDBSingleTableCommandParameters<typeof UpdateCommand> = {}
  ) => {
    // Destructure constants from updateItemOpts to set default ReturnValues
    const { ReturnValues = "ALL_NEW", ...otherUpdateItemOpts } = updateItemOpts;

    // Destructure updateItemOpts which may be updated
    let { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = updateItemOpts;

    if (!UpdateExpression) {
      /* For now, ensure the caller hasn't provided "ExpressionAttributeValues"
      /"ExpressionAttributeValues". In the future, however, the auto-gen'd EA
      Names/Values objects could be merged with the caller's EA Names/Values args,
      with any existing key-placeholders regex-swapped in the ConditionExpression
      (if provided). Support could also be added for nested value updates (right
        now it just uses top-level keys and values).      */
      if (ExpressionAttributeNames || ExpressionAttributeValues) {
        throw new Error(
          `(ddbTable.updateItem) For auto-generated "UpdateExpression"s, params "ExpressionAttribute{Names,Values}" must not be provided.`
        );
      }

      // Auto-gen UpdateExpression if not provided (and ExprAttrValues)
      // prettier-ignore
      ({ UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = generateUpdateExpression(attributesToUpdate));
    }

    const { Attributes } = await this.ddbDocClient.send(
      new UpdateCommand({
        ...otherUpdateItemOpts, // <-- Placed first, so the rest overwrite.
        ReturnValues,
        UpdateExpression,
        ...(ExpressionAttributeNames && { ExpressionAttributeNames }),
        ...(ExpressionAttributeValues && { ExpressionAttributeValues }),
        TableName: this.tableName,
        Key: primaryKeys
      })
    );

    return Attributes as Partial<ItemTypeFromSchema<Schema>>;
  };

  readonly deleteItem = async <Schema extends ModelSchemaType>(
    primaryKeys: ItemPrimaryKeys<Schema>,
    deleteItemOpts: DDBSingleTableCommandParameters<typeof DeleteCommand> = {}
  ) => {
    // Destructure constants from deleteItemOpts to set default ReturnValues (DeleteItem API default: "NONE")
    const { ReturnValues = "ALL_OLD", ...otherDeleteItemOpts } = deleteItemOpts;

    const { Attributes } = await this.ddbDocClient.send(
      new DeleteCommand({
        ...otherDeleteItemOpts, // <-- Placed first, so the rest overwrite.
        ReturnValues,
        TableName: this.tableName,
        Key: primaryKeys
      })
    );

    return Attributes as Partial<ItemTypeFromSchema<Schema>>;
  };

  readonly batchDeleteItems = async <Schema extends ModelSchemaType>(
    primaryKeys: Array<ItemPrimaryKeys<Schema>>,
    batchDeleteItemsOpts: DDBSingleTableCommandParameters<typeof BatchWriteCommand> = {}
  ) => {
    // TODO Add handling to batchDeleteItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchDeleteItemsOpts,
        RequestItems: {
          [this.tableName]: primaryKeys.map((keyObj) => ({ DeleteRequest: { Key: keyObj } }))
        }
      })
    );
  };

  readonly batchUpsertAndDeleteItems = async <Schema extends ModelSchemaType>(
    {
      upsertItems,
      deleteItems
    }: {
      upsertItems: Array<Partial<ItemTypeFromSchema<Schema>>>;
      deleteItems: Array<ItemPrimaryKeys<Schema>>;
    },
    batchUpsertAndDeleteItemsOpts: DDBSingleTableCommandParameters<typeof BatchWriteCommand> = {}
  ) => {
    // TODO Add handling to batchUpsertAndDeleteItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchUpsertAndDeleteItemsOpts,
        RequestItems: {
          [this.tableName]: [
            ...upsertItems.map((item) => ({ PutRequest: { Item: item } })),
            ...deleteItems.map((keyObj) => ({ DeleteRequest: { Key: keyObj } }))
          ]
        }
      })
    );
  };

  readonly query = async <Schema extends ModelSchemaType>(
    queryOpts: DDBSingleTableCommandParameters<typeof QueryCommand>
  ) => {
    const { Items } = await this.ddbDocClient.send(
      new QueryCommand({
        ...queryOpts,
        TableName: this.tableName
      })
    );

    return Items as Array<Partial<ItemTypeFromSchema<Schema>>>;
  };

  readonly scan = async <Schema extends ModelSchemaType>(
    scanOpts: DDBSingleTableCommandParameters<typeof ScanCommand> = {}
  ) => {
    const { Items } = await this.ddbDocClient.send(
      new ScanCommand({
        ...scanOpts,
        TableName: this.tableName
      })
    );

    return Items as Array<Partial<ItemTypeFromSchema<Schema>>>;
  };

  // UTILITY METHODS:

  readonly describeTable = async (tableName?: string) => {
    const { Table } = await this.ddbClient.send(
      new DescribeTableCommand({ TableName: tableName ?? this.tableName })
    );

    return Table ?? {};
  };

  readonly createTable = async (
    createTableArgs: DDBSingleTableCommandParameters<typeof CreateTableCommand>
  ) => {
    const { TableDescription } = await this.ddbClient.send(
      new CreateTableCommand({
        ...createTableArgs,
        TableName: this.tableName
      })
    );

    return TableDescription ?? {};
  };

  readonly listTables = async () => {
    const { TableNames } = await this.ddbClient.send(new ListTablesCommand({}));

    return TableNames ?? [];
  };
}
