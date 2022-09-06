import dynamoose from "dynamoose";
import { ENV } from "@server/env";
import { logger } from "@utils/logger";

export const dynamoDBclient = new dynamoose.aws.ddb.DynamoDB({
  region: ENV.AWS.REGION
});

dynamoose.aws.ddb.set(dynamoDBclient);

if (!ENV.IS_PROD) {
  dynamoose.aws.ddb.local(ENV.AWS.DYNAMODB_LOCAL_ENDPOINT_URL);

  logger.dynamodb(`Connected to DynamoDB Local Endpoint`);
}

["SIGINT", "SIGTERM", "SIGQUIT", "exit"].forEach((processEvent) => {
  process.once(processEvent, () => {
    logger.server(`(${processEvent}) Shutting down DynamoDB client ...`);
    dynamoDBclient.destroy();
  });
});

export { dynamoose };
