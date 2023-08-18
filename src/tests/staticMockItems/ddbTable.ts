import type { CreateTableInput } from "@aws-sdk/client-dynamodb";

export const MOCK_TABLE: {
  [Key in keyof CreateTableInput]: Exclude<CreateTableInput[Key], undefined>;
} = {
  TableName: "fixit-db-test",
  BillingMode: "PROVISIONED",
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" },
    { AttributeName: "sk", AttributeType: "S" },
    { AttributeName: "data", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" },
    { AttributeName: "sk", KeyType: "RANGE" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "Overloaded_SK_GSI",
      KeySchema: [
        { AttributeName: "sk", KeyType: "HASH" },
        { AttributeName: "data", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
      ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 },
    },
    {
      IndexName: "Overloaded_Data_GSI",
      KeySchema: [
        { AttributeName: "data", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
      ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 },
    },
  ],
};
