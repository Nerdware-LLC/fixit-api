import { mockClient } from "aws-sdk-client-mock";
import { MOCK_TABLE } from "@/tests/staticMockItems/ddbTable";
import type {
  ListTablesOutput,
  DescribeTableInput,
  DescribeTableOutput,
  CreateTableInput,
  CreateTableOutput,
} from "@aws-sdk/client-dynamodb";

const {
  DynamoDBClient: _DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  ListTablesCommand,
} = await vi.importActual<typeof import("@aws-sdk/client-dynamodb")>("@aws-sdk/client-dynamodb");

const DynamoDBClient = vi.fn(() =>
  mockClient(_DynamoDBClient)
    .on(DescribeTableCommand)
    .callsFake(({ TableName }: DescribeTableInput): DescribeTableOutput => {
      return {
        Table: {
          ...MOCK_TABLE,
          TableName,
          TableStatus: "ACTIVE",
          BillingModeSummary: { BillingMode: MOCK_TABLE.BillingMode },
        },
      };
    })
    .on(CreateTableCommand)
    .callsFake(({ BillingMode, ...args }: CreateTableInput): CreateTableOutput => {
      return {
        TableDescription: {
          ...args,
          TableStatus: "ACTIVE",
          BillingModeSummary: { BillingMode },
        },
      };
    })
    .on(ListTablesCommand)
    .callsFake((): ListTablesOutput => ({ TableNames: [MOCK_TABLE.TableName] }))
);

export { DynamoDBClient, DescribeTableCommand, CreateTableCommand, ListTablesCommand };
