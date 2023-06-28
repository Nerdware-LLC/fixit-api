import { DdbSingleTable } from "@lib/dynamoDB";
import { ENV } from "@server/env";

// Use ddb-local in dev and test environments.
const shouldUseDdbLocal = /^(dev|test)/i.test(ENV.NODE_ENV);

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
        throughput: { read: 5, write: 5 }, // <-- arbitrary throughput for ddb-local
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
        throughput: { read: 5, write: 5 }, // <-- arbitrary throughput for ddb-local
      },
    },
  } as const,
  ddbClientConfigs: {
    region: ENV.AWS.REGION,
    ...(shouldUseDdbLocal && { endpoint: "http://localhost:8000" }),
  },
  ...(!!shouldUseDdbLocal && {
    tableConfigs: {
      createIfNotExists: true,
      billingMode: "PROVISIONED",
      provisionedThroughput: { read: 20, write: 20 },
    },
  }),
});
