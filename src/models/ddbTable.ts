import { Table } from "@nerdware/ddb-single-table";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";

export const ddbTable = new Table({
  tableName: ENV.AWS.DYNAMODB_TABLE_NAME,
  tableKeysSchema: {
    pk: {
      type: "string",
      required: true,
      isHashKey: true,
    },
    sk: {
      type: "string",
      required: true,
      isRangeKey: true,
      index: {
        name: "Overloaded_SK_GSI", // For queries using "sk" as the hash key
        rangeKey: "data",
        global: true,
        project: true, // all attributes
        throughput: { read: 5, write: 5 },
      },
    },
    data: {
      type: "string",
      required: true,
      index: {
        name: "Overloaded_Data_GSI", // For queries using "data" as the hash key
        rangeKey: "sk",
        global: true,
        project: true, // all attributes
        throughput: { read: 5, write: 5 },
      },
    },
  } as const,
  ddbClient: {
    region: ENV.AWS.DYNAMODB_REGION,
    ...(ENV.AWS.DYNAMODB_ENDPOINT && { endpoint: ENV.AWS.DYNAMODB_ENDPOINT }),
    // dynamodb-local is used in dev
    ...(ENV.IS_DEV && {
      credentials: {
        accessKeyId: "local",
        secretAccessKey: "local",
      },
    }),
  },
  logger: logger.dynamodb,
});

// Ensure the target DDB table is connected and configured:
await ddbTable.ensureTableIsActive({
  createIfNotExists: {
    BillingMode: "PROVISIONED",
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
});
