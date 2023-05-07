import { DDBSingleTableClient } from "./DDBSingleTableClient";
import { ensureTableIsActive } from "./ensureTableIsActive";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import type { Simplify } from "type-fest";
import type { TableKeysSchemaType, DDBTableIndexes, DDBTableProperties } from "./types";

/**
 * DDBSingleTable is a wrapper around DDBSingleTableClient that provides a
 * higher-level interface for interacting with a single DynamoDB table.
 *
 * @param tableName - The name of the DynamoDB table.
 * @param tableKeysSchema - The schema of the table's primary and sort keys.
 * @param tableConfigs - Configs for the table.
 * @param ddbClientConfigs - Configs for the DDBSingleTableClient.
 * @param waitForActive - Configs for waiting for the table to become active.
 * @param isTableActive - Whether the table is active.
 * @returns A DDBSingleTable instance.
 */
export class DDBSingleTable {
  private static readonly DEFAULTS = {
    WAIT_FOR_ACTIVE: {
      enabled: true,
      timeout: 30000,
      frequency: 1000,
      maxAttempts: 20,
    },
    TABLE_CONFIGS: {
      createIfNotExists: false,
      updateIfExists: false, // TODO impl this
    },
  };

  // INSTANCE PROPERTIES
  readonly tableName: string;
  readonly tableKeysSchema: TableKeysSchemaType;
  readonly tableConfigs: typeof DDBSingleTable.DEFAULTS.TABLE_CONFIGS & DDBTableProperties;
  readonly indexes: DDBTableIndexes;
  readonly ddbClient: DDBSingleTableClient;
  protected readonly waitForActive: typeof DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE;
  isTableActive: boolean;

  constructor({
    tableName,
    tableKeysSchema,
    tableConfigs = DDBSingleTable.DEFAULTS.TABLE_CONFIGS,
    ddbClientConfigs = {},
    waitForActive = DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE,
  }: {
    tableName: string;
    tableKeysSchema: TableKeysSchemaType;
    tableConfigs?: Partial<typeof DDBSingleTable.DEFAULTS.TABLE_CONFIGS> & DDBTableProperties;
    ddbClientConfigs?: Simplify<DynamoDBClientConfig & TranslateConfig>;
    waitForActive?: Partial<typeof DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE>;
  }) {
    // Initialize high-level table properties
    this.tableName = tableName;
    this.tableKeysSchema = tableKeysSchema;
    this.tableConfigs = { ...DDBSingleTable.DEFAULTS.TABLE_CONFIGS, ...tableConfigs };

    // Identify the indexes, if any, to provide a map user can use to build query args.
    this.indexes = Object.entries(tableKeysSchema).reduce((accum, [keyAttrName, keyAttrConfig]) => {
      if (keyAttrConfig?.index) {
        accum[keyAttrConfig.index.name] = {
          name: keyAttrConfig.index.name,
          type: keyAttrConfig.index?.global === true ? "GLOBAL" : "LOCAL",
          indexPK: keyAttrName,
          ...(keyAttrConfig.index?.rangeKey && { indexSK: keyAttrConfig.index.rangeKey }),
        };
      }

      return accum;
    }, {} as DDBTableIndexes);

    // Initialize DDB client
    this.ddbClient = new DDBSingleTableClient({
      tableName,
      ddbClientConfigs,
    });

    // Initialize table-status properties which can be used to avoid resource-not-found DDB client errors
    this.waitForActive = { ...DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE, ...waitForActive };
    this.isTableActive = !this.waitForActive.enabled;
  }

  // INSTANCE METHODS

  readonly ensureTableIsActive = ensureTableIsActive;
}
