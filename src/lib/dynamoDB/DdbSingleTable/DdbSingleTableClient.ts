import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  ListTablesCommand,
  type DynamoDBClientConfig,
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
  type TranslateConfig,
} from "@aws-sdk/lib-dynamodb";
import { generateKeyConditionExpression } from "./generateKeyConditionExpression";
import { generateUpdateExpression } from "./generateUpdateExpression";
import { ItemInputError } from "./utils";
import type { Simplify } from "type-fest";
import type {
  DdbTableIndexes,
  GetItemOpts,
  BatchGetItemsOpts,
  CreateItemOpts,
  UpsertItemOpts,
  BatchUpsertItemsOpts,
  UpdateItemOpts,
  DeleteItemOpts,
  BatchDeleteItemsOpts,
  BatchUpsertAndDeleteItemsOpts,
  QueryOpts,
  ScanOpts,
  CreateTableOpts,
} from "./types";

/**
 * A DynamoDB CRUD utility for single-table designs. All methods wrap DDB API
 * commands to provide a simplified DDB API interface to consuming modules.
 */
export class DdbSingleTableClient {
  // STATIC PROPERTIES
  private static readonly DEFAULTS = {
    marshallOptions: {
      /** Whether to automatically convert empty strings, blobs, and sets to `null` (client default: false). */
      convertEmptyValues: false,
      /** Whether to remove undefined values while marshalling (client default: false). */
      removeUndefinedValues: true,
      /** Whether to convert typeof object to map attribute (client default: false). */
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      /** Whether to return numbers as a string instead of converting them to native JavaScript numbers (client default: false). */
      wrapNumbers: false,
    },
  };

  // INSTANCE PROPERTIES
  readonly tableName: string;
  readonly tableHashKey: string;
  readonly tableRangeKey: string;
  readonly indexes: DdbTableIndexes;

  // PRIVATE INSTANCE PROPERTIES
  private readonly ddbClient: DynamoDBClient;
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor({
    tableName,
    tableHashKey,
    tableRangeKey,
    indexes,
    ddbClientConfigs: {
      marshallOptions = DdbSingleTableClient.DEFAULTS.marshallOptions,
      unmarshallOptions = DdbSingleTableClient.DEFAULTS.unmarshallOptions,
      ...ddbClientConfigs
    },
  }: {
    tableName: string;
    tableHashKey: string;
    tableRangeKey: string;
    indexes: DdbTableIndexes;
    ddbClientConfigs: Simplify<DynamoDBClientConfig & TranslateConfig>;
  }) {
    this.tableName = tableName;
    this.tableHashKey = tableHashKey;
    this.tableRangeKey = tableRangeKey;
    this.indexes = indexes;

    // Initialize ddbClient and attach proc exit handler which calls destroy method.
    this.ddbClient = new DynamoDBClient(ddbClientConfigs);
    process.on("exit", () => this.ddbClient.destroy());

    // Initialize ddbDocClient
    this.ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient, {
      marshallOptions,
      unmarshallOptions,
    });
  }

  // INSTANCE METHODS:

  /** `GetItem` command wrapper. */
  readonly getItem = async (
    primaryKeys: Record<string, unknown>,
    getItemOpts: GetItemOpts = {}
  ) => {
    const { Item } = await this.ddbDocClient.send(
      new GetCommand({
        ...getItemOpts,
        TableName: this.tableName,
        Key: primaryKeys,
      })
    );

    return Item;
  };

  /** `BatchGetItem` command wrapper. */
  readonly batchGetItems = async (
    primaryKeys: Array<Record<string, unknown>>,
    batchGetItemsOpts: BatchGetItemsOpts = {}
  ) => {
    const result = await this.ddbDocClient.send(
      new BatchGetCommand({
        ...batchGetItemsOpts,
        RequestItems: {
          [this.tableName]: {
            Keys: primaryKeys,
          },
        },
      })
    );

    // IDEA Add handling to batchGetItems for `result.UnprocessedKeys`
    const { [this.tableName]: items } = result?.Responses ?? {};

    return items;
  };

  /**
   * An aliased form of the `PutItem` command which always includes the
   * ConditionExpression `"attribute_not_exists([tableHashKey])"`.
   */
  readonly createItem = async (
    item: Record<string, unknown>,
    createItemOpts: CreateItemOpts = {}
  ) => {
    await this.ddbDocClient.send(
      new PutCommand({
        ...createItemOpts,
        TableName: this.tableName,
        Item: item,
        ConditionExpression: `attribute_not_exists(${this.tableHashKey})`,
        /* Note that appending "AND attribute_not_exists(sk)" to the
        above expression would be extraneous, since DDB PutItem first
        looks for an Item with the specified item's keys, and THEN it
        applies the condition expression if it finds one.          */
      })
    );
    /* PutItem ReturnValues can only be NONE or ALL_OLD, so the DDB
    API will never return anything here. */
  };

  /**
   * An aliased form of the `PutItem` command. It can return an updated Item's old
   * values if `opts.ReturnValues` is set to "ALL_OLD", otherwise it returns
   * undefined. If not provided, `opts.ReturnValues` is set to "ALL_OLD".
   */
  readonly upsertItem = async (item: Record<string, any>, upsertItemOpts: UpsertItemOpts = {}) => {
    // Set ReturnValues default to "ALL_OLD"
    const { ReturnValues = "ALL_OLD", ...otherUpsertItemOpts } = upsertItemOpts;

    const { Attributes } = await this.ddbDocClient.send(
      new PutCommand({
        ...otherUpsertItemOpts,
        ReturnValues,
        TableName: this.tableName,
        Item: item,
      })
    );

    return Attributes;
  };

  /**
   * An aliased form of the `BatchWriteItem` command which is only used for
   * `PutItem` operations.
   *
   * > Note: `BatchWriteItem` does not support condition expressions.
   */
  readonly batchUpsertItems = async (
    items: Array<Record<string, unknown>>,
    batchUpsertItemsOpts: BatchUpsertItemsOpts = {}
  ) => {
    // IDEA Add handling to batchUpsertItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchUpsertItemsOpts,
        RequestItems: {
          [this.tableName]: items.map((item) => ({ PutRequest: { Item: item } })),
        },
      })
    );
  };

  /**
   * `UpdateItem` command wrapper. If an `UpdateExpression` is not provided, this
   * method will auto-generate one for you using the provided item's keys+values to
   * form SET and REMOVE clauses. To disable the auto-gen behavior, set the param
   * `autogenUpdateExpressionOpts.enabled` to false.
   *
   * The function which generates the `UpdateExpression` also creates a map for
   * `ExpressionAttributeValues`, therefore providing an EAV arg without an
   * `UpdateExpression` currently will result in an error (e.g., if you provide an
   * EAV for a `ConditionExpression` without also providing an `UpdateExpression`).
   */
  readonly updateItem = async (
    primaryKeys: Record<string, unknown>,
    attributesToUpdate: Record<string, any>,
    { autogenUpdateExpressionOpts, ...updateItemOpts }: UpdateItemOpts = {}
  ) => {
    // Destructure constants from updateItemOpts to set default ReturnValues
    const { ReturnValues = "ALL_NEW", ...otherUpdateItemOpts } = updateItemOpts;

    // Destructure updateItemOpts which may be updated
    let { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = updateItemOpts;

    if (!UpdateExpression && autogenUpdateExpressionOpts?.enabled !== false) {
      // Auto-gen will overwrite EA-Names/Values, so ensure the caller hasn't provided them
      if (ExpressionAttributeNames || ExpressionAttributeValues) {
        throw new ItemInputError(
          `[updateItem] For auto-generated "UpdateExpression"s, params "ExpressionAttribute{Names,Values}" must not be provided.`
        );
      }

      ({ UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
        generateUpdateExpression(attributesToUpdate, autogenUpdateExpressionOpts));
    }

    const { Attributes } = await this.ddbDocClient.send(
      new UpdateCommand({
        ...otherUpdateItemOpts, // <-- Placed first, so the rest overwrite.
        ReturnValues,
        UpdateExpression,
        ...(ExpressionAttributeNames && { ExpressionAttributeNames }),
        ...(ExpressionAttributeValues && { ExpressionAttributeValues }),
        TableName: this.tableName,
        Key: primaryKeys,
      })
    );

    return Attributes;
  };

  /** `DeleteItem` command wrapper. */
  readonly deleteItem = async (
    primaryKeys: Record<string, unknown>,
    deleteItemOpts: DeleteItemOpts = {}
  ) => {
    // Destructure constants from deleteItemOpts to set default ReturnValues (DeleteItem API default: "NONE")
    const { ReturnValues = "ALL_OLD", ...otherDeleteItemOpts } = deleteItemOpts;

    const { Attributes } = await this.ddbDocClient.send(
      new DeleteCommand({
        ...otherDeleteItemOpts, // <-- Placed first, so the rest overwrite.
        ReturnValues,
        TableName: this.tableName,
        Key: primaryKeys,
      })
    );

    return Attributes;
  };

  /**
   * An aliased form of the `BatchWriteItem` command which is only used for
   * `DeleteItem` operations.
   *
   * > Note: `BatchWriteItem` does not support condition expressions.
   */
  readonly batchDeleteItems = async (
    primaryKeys: Array<Record<string, unknown>>,
    batchDeleteItemsOpts: BatchDeleteItemsOpts = {}
  ) => {
    // IDEA Add handling to batchDeleteItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchDeleteItemsOpts,
        RequestItems: {
          [this.tableName]: primaryKeys.map((keyObj) => ({ DeleteRequest: { Key: keyObj } })),
        },
      })
    );
  };

  /**
   * An aliased form of the `BatchWriteItem` command which can be used to
   * execute conditionless `PutItem` and `DeleteItem` operations in the same call.
   * Note that while each individual underlying command operation is atomic, they're
   * not atomic as a a whole, despite occurring within the same call.
   */
  readonly batchUpsertAndDeleteItems = async (
    {
      upsertItems,
      deleteItems,
    }: {
      upsertItems: Array<Record<string, any>>;
      deleteItems: Array<Record<string, unknown>>;
    },
    batchUpsertAndDeleteItemsOpts: BatchUpsertAndDeleteItemsOpts = {}
  ) => {
    // IDEA Add handling to batchUpsertAndDeleteItems for `result.UnprocessedItems`
    await this.ddbDocClient.send(
      new BatchWriteCommand({
        ...batchUpsertAndDeleteItemsOpts,
        RequestItems: {
          [this.tableName]: [
            ...upsertItems.map((item) => ({ PutRequest: { Item: item } })),
            ...deleteItems.map((keyObj) => ({ DeleteRequest: { Key: keyObj } })),
          ],
        },
      })
    );
  };

  /** `Query` command wrapper. */
  readonly query = async ({
    where,
    limit, // lower-cased alias for "Limit"
    KeyConditionExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    IndexName,
    ...otherQueryOpts
  }: QueryOpts) => {
    // Check if Where-API object is provided (unaliased by Model.query wrapper method)
    if (where) {
      const [pkAttrName, skAttrName] = Object.keys(where);
      // Generate the KeyConditionExpression and related values
      ({ KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
        generateKeyConditionExpression({ where }));

      // See if IndexName needs to be set by testing if `where` contains the table's PK+SK
      if (
        !IndexName && // skAttrName may be undefined if the `where` only contains the PK
        (pkAttrName !== this.tableHashKey || (!!skAttrName && skAttrName !== this.tableRangeKey))
      ) {
        // Get IndexName by searching table's indexes for matching PK+SK
        for (const indexName in this.indexes) {
          if (
            pkAttrName === this.indexes[indexName].indexPK &&
            (!skAttrName || skAttrName === this.indexes[indexName]?.indexSK)
          ) {
            IndexName = indexName;
            break;
          }
        }
      }
    }

    const { Items } = await this.ddbDocClient.send(
      new QueryCommand({
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ...(IndexName && { IndexName }),
        ...(limit && { Limit: limit }),
        ...otherQueryOpts,
        TableName: this.tableName,
      })
    );

    return Items;
  };

  /** `Scan` command wrapper. */
  readonly scan = async (scanOpts: ScanOpts = {}) => {
    const { Items } = await this.ddbDocClient.send(
      new ScanCommand({
        ...scanOpts,
        TableName: this.tableName,
      })
    );

    return Items;
  };

  // UTILITY METHODS:

  /** `DescribeTable` command wrapper. */
  readonly describeTable = async (tableName?: string) => {
    const { Table } = await this.ddbClient.send(
      new DescribeTableCommand({ TableName: tableName ?? this.tableName })
    );

    return Table ?? {};
  };

  /** `CreateTable` command wrapper. */
  readonly createTable = async (createTableArgs: CreateTableOpts) => {
    const { TableDescription } = await this.ddbClient.send(
      new CreateTableCommand({
        ...createTableArgs,
        TableName: this.tableName,
      })
    );

    return TableDescription ?? {};
  };

  /** `ListTables` command wrapper. */
  readonly listTables = async () => {
    const { TableNames } = await this.ddbClient.send(new ListTablesCommand({}));

    return TableNames ?? [];
  };
}
