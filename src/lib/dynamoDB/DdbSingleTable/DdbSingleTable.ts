import { DdbSingleTableClient } from "./DdbSingleTableClient";
import { Model } from "./Model";
import { ensureTableIsActive } from "./ensureTableIsActive";
import { getMergedModelSchema } from "./getMergedModelSchema";
import { DdbSingleTableError } from "./utils";
import { validateTableKeysSchema } from "./validateTableKeysSchema";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import type { Simplify } from "type-fest";
import type {
  DdbTableProperties,
  DdbTableIndexes,
  TableKeysSchemaType,
  ModelSchemaType,
  ModelSchemaOptions,
  MergeModelAndTableKeysSchema,
  ItemInputType,
  ItemOutputType,
} from "./types";

/**
 * DdbSingleTable is a wrapper around DdbSingleTableClient that provides a
 * higher-level interface for interacting with a single DynamoDB table.
 *
 * #### Table Keys Schema
 *
 * The table's primary and sort keys are defined in the {@link tableKeysSchema}
 * argument. When a new `DdbSingleTable` instance is created, the following
 * validations are performed on the `tableKeysSchema`:
 *
 *   1. Ensure all key/index attributes specify `isHashKey`, `isRangeKey`, or `index`.
 *   2. Ensure exactly 1 table hash key, and 1 table range key are specified.
 *   3. Ensure all key/index attribute `type`s are "string", "number", or "Buffer" (S/N/B in the DDB API).
 *   4. Ensure all key/index attributes are `required`.
 *   5. Ensure there are no duplicate index names.
 *   6. If tableConfigs.billingMode is "PAY_PER_REQUEST", ensure indexes don't set `throughput`.
 *
 * @class DdbSingleTable
 * @param tableName - The name of the DynamoDB table.
 * @param tableKeysSchema - The schema of the table's primary and sort keys.
 * @param tableConfigs - Configs for the table.
 * @param ddbClientConfigs - Configs for the DdbSingleTableClient.
 * @param waitForActive - Configs for waiting for the table to become active.
 */
export class DdbSingleTable<TableKeysSchema extends TableKeysSchemaType> {
  private static readonly DEFAULTS = {
    WAIT_FOR_ACTIVE: {
      enabled: true,
      timeout: 30000,
      frequency: 1000,
      maxAttempts: 20,
    },
    TABLE_CONFIGS: {
      createIfNotExists: false,
      // IDEA Add support for an `updateIfExists` config
    },
  };

  // INSTANCE PROPERTIES
  readonly tableName: string;
  readonly tableKeysSchema: TableKeysSchema;
  readonly tableConfigs: typeof DdbSingleTable.DEFAULTS.TABLE_CONFIGS & DdbTableProperties;
  readonly tableHashKey: string;
  readonly tableRangeKey: string;
  /** Map of index configs which can be used to build `query` arguments. */
  readonly indexes: DdbTableIndexes;
  readonly ddbClient: DdbSingleTableClient;
  protected readonly waitForActive: typeof DdbSingleTable.DEFAULTS.WAIT_FOR_ACTIVE;
  isTableActive: boolean;

  constructor({
    tableName,
    tableKeysSchema,
    tableConfigs = DdbSingleTable.DEFAULTS.TABLE_CONFIGS,
    ddbClientConfigs = {},
    waitForActive = DdbSingleTable.DEFAULTS.WAIT_FOR_ACTIVE,
  }: {
    tableName: string;
    tableKeysSchema: TableKeysSchema;
    tableConfigs?: Partial<typeof DdbSingleTable.DEFAULTS.TABLE_CONFIGS> & DdbTableProperties;
    ddbClientConfigs?: Simplify<DynamoDBClientConfig & TranslateConfig>;
    waitForActive?: Partial<typeof DdbSingleTable.DEFAULTS.WAIT_FOR_ACTIVE>;
  }) {
    // Initialize high-level table properties
    this.tableName = tableName;
    this.tableKeysSchema = tableKeysSchema;

    // Validate the tableConfigs
    if (tableConfigs.billingMode === "PAY_PER_REQUEST" && "provisionedThroughput" in tableConfigs) {
      throw new DdbSingleTableError(
        "Invalid 'tableConfigs', 'provisionedThroughput' should not be provided when billingMode is 'PAY_PER_REQUEST'."
      );
    } else {
      Object.keys(tableConfigs).forEach((key) => {
        if (!["billingMode", "provisionedThroughput", "createIfNotExists"].includes(key)) {
          throw new DdbSingleTableError(`Invalid 'tableConfigs', unrecognized key: "${key}"`);
        }
      });
    }

    this.tableConfigs = { ...DdbSingleTable.DEFAULTS.TABLE_CONFIGS, ...tableConfigs };

    // Validate the TableKeysSchema and obtain the table's keys+indexes
    const { tableHashKey, tableRangeKey, indexes } = validateTableKeysSchema({
      tableKeysSchema,
      tableConfigs,
    });

    // Set the keys+indexes, and instantiate the DDB client
    this.tableHashKey = tableHashKey;
    this.tableRangeKey = tableRangeKey;
    this.indexes = indexes;
    this.ddbClient = new DdbSingleTableClient({
      tableName,
      tableHashKey,
      tableRangeKey,
      indexes,
      ddbClientConfigs,
    });
    // Set table-status props that help avoid resource-not-found DDB client errors
    this.waitForActive = { ...DdbSingleTable.DEFAULTS.WAIT_FOR_ACTIVE, ...waitForActive };
    this.isTableActive = !this.waitForActive.enabled;
  }

  // INSTANCE METHODS:

  readonly ensureTableIsActive = ensureTableIsActive;

  /** Returns a ModelSchema with the TableKeysSchema merged in. */
  readonly getModelSchema = <ModelSchema extends ModelSchemaType<TableKeysSchema>>(
    modelSchema: ModelSchema
  ) => {
    return getMergedModelSchema<TableKeysSchema, ModelSchema>({
      tableKeysSchema: this.tableKeysSchema,
      modelSchema,
    });
  };

  readonly createModel = <
    ModelSchema extends ModelSchemaType<TableKeysSchema>,
    ItemOutput extends Record<string, any> = ItemOutputType<
      MergeModelAndTableKeysSchema<TableKeysSchema, ModelSchema>
    >,
    ItemInput extends Record<string, any> = ItemInputType<
      MergeModelAndTableKeysSchema<TableKeysSchema, ModelSchema>
    >
  >(
    modelName: string,
    modelSchema: ModelSchema,
    modelSchemaOptions: ModelSchemaOptions = {}
  ) => {
    return new Model<
      MergeModelAndTableKeysSchema<TableKeysSchema, ModelSchema>,
      ItemOutput,
      ItemInput
    >(modelName, this.getModelSchema(modelSchema), {
      ...modelSchemaOptions,
      tableHashKey: this.tableHashKey,
      tableRangeKey: this.tableRangeKey,
      indexes: this.indexes,
      ddbClient: this.ddbClient,
    });
  };
}
