import { ddbSingleTable } from "@models/ddbSingleTable";
import { ENV } from "@server/env";
import { logger } from "@utils/logger";

await ddbSingleTable.ensureTableIsActive();

/^(dev|test)/i.test(ENV.NODE_ENV) && logger.dynamodb("Using dynamodb-local");
