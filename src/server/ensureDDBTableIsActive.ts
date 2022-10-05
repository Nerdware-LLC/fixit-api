import { ddbSingleTable } from "@lib/dynamoDB";
import { logger } from "@utils/logger";

await ddbSingleTable.ensureTableIsActive();

/^(dev|test)/i.test(process.env.NODE_ENV) && logger.dynamodb("Using dynamodb-local");
