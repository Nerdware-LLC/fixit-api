import { DdbSingleTable } from "@/lib/dynamoDB";
import { ENV } from "@/server/env";

export const ddbSingleTable = new DdbSingleTable({
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
        name: "Overloaded_SK_GSI", // For relational queryies using "sk" as the hash key
        rangeKey: "data", // TODO Double check - is any model using this GSI sk?
        global: true,
        project: true, // all attributes
        throughput: { read: 5, write: 5 }, // TODO Figure out what throughput to use in demo/prod (arbitrary throughput for ddb-local)
      },
    },
    data: {
      type: "string",
      required: true,
      index: {
        name: "Overloaded_Data_GSI", // For relational queries using "data" as the hash key
        rangeKey: "sk", // WO query "WorkOrdersAssignedToUser" uses this GSI SK
        global: true,
        project: true, // all attributes
        throughput: { read: 5, write: 5 }, // TODO arbitrary throughput for ddb-local
      },
    },
  } as const,
  ddbClientConfigs: {
    region: ENV.AWS.REGION,
    endpoint: ENV.AWS.DYNAMODB_ENDPOINT,
    // dynamodb-local is used in dev and test environments
    ...(ENV.AWS.REGION === "local" && {
      credentials: {
        accessKeyId: "local",
        secretAccessKey: "local",
      },
    }),
  },
  ...(ENV.AWS.REGION === "local" && {
    tableConfigs: {
      createIfNotExists: true,
      billingMode: "PROVISIONED",
      provisionedThroughput: { read: 20, write: 20 },
    },
  }),
});
