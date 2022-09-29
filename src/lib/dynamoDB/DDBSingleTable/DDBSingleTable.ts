import { DDBSingleTableClient } from "./DDBSingleTableClient";
import { ensureTableIsActive } from "./ensureTableIsActive";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import type { TableKeysSchemaType, DDBTableIndexes, DDBTableProperties } from "./types";

// TODO Add jsdoc once further ironed out
export class DDBSingleTable {
  private static readonly DEFAULTS = {
    WAIT_FOR_ACTIVE: {
      enabled: true,
      timeout: 30000,
      frequency: 1000,
      maxAttempts: 20
    },
    TABLE_CONFIGS: {
      createIfNotExists: false,
      updateIfExists: false // TODO impl this
    }
  };

  // INSTANCE PROPERTIES
  readonly tableName: string;
  readonly tableKeysSchema: TableKeysSchemaType;
  readonly indexes: DDBTableIndexes;
  readonly ddbClient: DDBSingleTableClient;
  readonly waitForActive: typeof DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE;
  readonly tableConfigs: typeof DDBSingleTable.DEFAULTS.TABLE_CONFIGS & DDBTableProperties;

  constructor({
    tableName,
    tableKeysSchema,
    ddbClientConfigs = {},
    waitForActive = DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE,
    tableConfigs = DDBSingleTable.DEFAULTS.TABLE_CONFIGS
  }: {
    tableName: string;
    tableKeysSchema: TableKeysSchemaType;
    ddbClientConfigs?: Expand<DynamoDBClientConfig & TranslateConfig>;
    waitForActive?: Partial<typeof DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE>;
    tableConfigs?: Partial<typeof DDBSingleTable.DEFAULTS.TABLE_CONFIGS> & DDBTableProperties;
  }) {
    this.tableName = tableName;
    this.tableKeysSchema = tableKeysSchema;
    this.waitForActive = {
      ...DDBSingleTable.DEFAULTS.WAIT_FOR_ACTIVE,
      ...waitForActive
    };
    this.tableConfigs = {
      ...DDBSingleTable.DEFAULTS.TABLE_CONFIGS,
      ...tableConfigs
    };

    // Initialize DDB client
    this.ddbClient = new DDBSingleTableClient({
      tableName,
      ddbClientConfigs
    });

    // Identify the indexes, if any, to provide a map user can use to build query args.
    this.indexes = Object.entries(tableKeysSchema).reduce((accum, [keyAttrName, keyAttrConfig]) => {
      if (keyAttrConfig?.index) {
        accum[keyAttrConfig.index.name] = {
          name: keyAttrConfig.index.name,
          type: keyAttrConfig.index?.global === true ? "GLOBAL" : "LOCAL",
          indexPK: keyAttrName,
          ...(keyAttrConfig.index?.rangeKey && { indexSK: keyAttrConfig.index.rangeKey })
        };
      }

      return accum;
    }, {} as DDBTableIndexes);
  }

  // INSTANCE METHODS

  readonly ensureTableIsActive = ensureTableIsActive;
}
