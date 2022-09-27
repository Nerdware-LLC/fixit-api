import merge from "lodash.merge";
import { DDBSingleTableClient } from "./DDBSingleTableClient";
import { ensureTableIsActive } from "./ensureTableIsActive";
import { SchemaValidationError } from "./customErrors";
import { Model } from "./Model";
import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import type {
  TableKeysSchemaType,
  ModelSchemaType,
  ModelSchemaOptions,
  AliasedModelSchemaType,
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
    // Ensure all table keys are present in the schema and that "type" is the same if provided.
    Object.keys(this.tableKeysSchema).forEach((tableKey) => {
      if (!(tableKey in modelSchema)) {
        throw new SchemaValidationError(
          `"${modelName}" Model schema does not contain key attribute "${tableKey}".`
        );
      }

      // Ensure the Model schema doesn't specify an invalid "type" in key configs.
      if (
        Object.prototype.hasOwnProperty.call(modelSchema[tableKey], "type") &&
        modelSchema[tableKey].type !== this.tableKeysSchema[tableKey].type
      ) {
        throw new SchemaValidationError(
          `"${modelName}" Model schema defines a different "type" for "${tableKey}" than is specified in the Table Keys Schema.`
        );
      }
    });

    const newModel = new Model<Schema, AliasedModelSchemaType<Schema>>(
      modelName,
      merge(this.tableKeysSchema, modelSchema),
      modelSchemaOptions,
      this.ddbClient
    );

    // If addModelMethods was provided, bind them here.
    if (modelSchemaOptions?.addModelMethods) {
      Object.entries(modelSchemaOptions.addModelMethods).forEach(([methodName, methodFn]) => {
        // Ensure 'methodName' is not already present, throw error if so.
        if (Object.prototype.hasOwnProperty.call(newModel, methodName)) {
          throw new SchemaValidationError(
            `"${modelName}" Model schema options contains additional methods with names which already exist on "${modelName}".`
          );
        }

        Object.defineProperty(newModel, methodName, {
          value: methodFn.bind(newModel),
          writable: false,
          enumerable: false,
          configurable: false
        });
      });
    }

    return newModel;
  };
}
