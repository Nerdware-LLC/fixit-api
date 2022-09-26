import { ENV } from "@server/env";
import { logger } from "@utils/logger";
import { DDBSingleTable } from "./DDBSingleTable";

const {
  NODE_ENV,
  AWS: { REGION, DYNAMODB_TABLE_NAME, DYNAMODB_LOCAL_ENDPOINT_URL }
} = ENV;

// Use ddb-local in dev and test environments.
const shouldUseDDBlocal = /^(dev|test)/i.test(NODE_ENV);
if (shouldUseDDBlocal) logger.dynamodb("Using dynamodb-local");

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
        project: true // all attributes
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
        project: true // all attributes
      }
    }
  },
  ddbClientConfigs: {
    region: REGION,
    ...(shouldUseDDBlocal && { endpoint: DYNAMODB_LOCAL_ENDPOINT_URL })
  }
});

await ddbSingleTable.ensureTableIsActive();
