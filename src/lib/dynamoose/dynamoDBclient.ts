import dynamoose from "dynamoose";
import { ENV } from "@server/env";
import { logger } from "@utils/logger";
import { Table } from "./Table";

const dynamoDBclient = new dynamoose.aws.ddb.DynamoDB({
  region: ENV.AWS.REGION
});

// Use dynamodb-local in dev and test environments
if (/^(dev|test)/i.test(ENV.NODE_ENV)) {
  dynamoose.aws.ddb.local(ENV.AWS.DYNAMODB_LOCAL_ENDPOINT_URL);
  logger.dynamodb("Using DynamoDB Local Endpoint. Initializing Table (timeout:30s) ...");

  try {
    await Table.initialize();
    logger.dynamodb("Local table initialization complete.");
  } catch (err) {
    logger.error(err, "Local table initialization timed out after 30 seconds.");
  }
}

// Clean up ddb resources before proc exit
["SIGINT", "SIGTERM", "SIGQUIT", "exit"].forEach((processEvent) => {
  process.once(processEvent, () => {
    logger.server(`(${processEvent}) Shutting down DynamoDB client ...`);
    dynamoDBclient.destroy();
  });
});
