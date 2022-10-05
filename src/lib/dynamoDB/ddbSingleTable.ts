import { ENV } from "@server/env";
import { DDBSingleTable } from "./DDBSingleTable";

const {
  NODE_ENV,
  AWS: { REGION, DYNAMODB_TABLE_NAME, DYNAMODB_LOCAL_ENDPOINT_URL }
} = ENV;

// Use ddb-local in dev and test environments.
const shouldUseDDBlocal = /^(dev|test)/i.test(NODE_ENV);

export const ddbSingleTable = new DDBSingleTable({
  tableName: DYNAMODB_TABLE_NAME,
  tableKeysSchema: {
    pk: {
      type: "string",
      isHashKey: true,
      required: true
    },
    sk: {
      type: "string",
      isRangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data", // TODO Double check - is any model using this GSI sk?
        project: true, // all attributes
        throughput: { read: 5, write: 5 } // <-- arbitrary throughput for ddb-local
      }
    },
    data: {
      type: "string",
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk", // WO queryWorkOrdersAssignedToUser uses this GSI SK
        project: true, // all attributes
        throughput: { read: 5, write: 5 } // <-- arbitrary throughput for ddb-local
      }
    }
  } as const,
  // DynamoDB client
  ddbClientConfigs: {
    region: REGION,
    ...(shouldUseDDBlocal && { endpoint: DYNAMODB_LOCAL_ENDPOINT_URL })
  },
  // Table CRUD behavior - in dev/test envs, use ddb-local Table with arbitrary throughput.
  ...(!!shouldUseDDBlocal && {
    tableConfigs: {
      createIfNotExists: true,
      billingMode: "PROVISIONED",
      provisionedThroughput: { read: 20, write: 20 }
    }
  })
});
