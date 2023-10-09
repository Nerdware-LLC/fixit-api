import { mockClient } from "aws-sdk-client-mock";

const {
  DynamoDBClient: Actual_DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  ListTablesCommand,
} = await vi.importActual<typeof import("@aws-sdk/client-dynamodb")>("@aws-sdk/client-dynamodb");

const DynamoDBClient = vi.fn(() => mockClient(Actual_DynamoDBClient));

export { DynamoDBClient, DescribeTableCommand, CreateTableCommand, ListTablesCommand };
