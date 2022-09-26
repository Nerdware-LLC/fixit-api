import { DDBSingleTableClient } from "./DDBSingleTableClient";
import { ensureTableIsActive } from "./ensureTableIsActive";
import { Model } from "./Model";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import type {
  TableKeysSchemaType,
  ModelSchemaType,
  ModelSchemaOptions,
  DDBTableProperties
} from "./types";

// TODO Add jsdoc once further ironed out
export class DDBSingleTable<TableKeysSchema extends TableKeysSchemaType> {
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
  readonly tableKeysSchema: TableKeysSchema;
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
    tableKeysSchema: TableKeysSchema;
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
  }

  // INSTANCE METHODS

  readonly ensureTableIsActive = ensureTableIsActive<TableKeysSchema>;

  readonly model = <Schema extends ModelSchemaType>(
    modelName: string,
    modelSchema: Schema,
    modelSchemaOptions: ModelSchemaOptions = {}
  ) => {
    return new Model<Schema>(modelName, modelSchema, modelSchemaOptions, this.ddbClient);
  };
}
