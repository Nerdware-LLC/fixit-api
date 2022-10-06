const {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand
} = require("@aws-sdk/client-dynamodb");

module.exports = async function () {
  // These opts are hard-coded bc this file does not have access to env vars passed to jest
  const ddbClient = new DynamoDBClient({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
  });

  const describeTableResponse = await ddbClient
    .send(new DescribeTableCommand({ TableName: "fixit-db-test" }))
    .catch(() => console.info("")); // swallow error, print \n

  if (!describeTableResponse || describeTableResponse?.Table?.TableStatus !== "ACTIVE") {
    console.info("[Jest:GlobalSetup] Creating test-env DDB-Local table ...");

    /* CreateTable args are hard-coded below because importing/requiring our table
    schema from here fails since virtually all project files are written as ESM.
    Attempting to dynamically import the ESM failed, as did converting this file to
    ESM/TS and explicitly registering ts-node. */

    const { TableDescription } = await ddbClient.send(
      new CreateTableCommand({
        TableName: "fixit-db-test",
        BillingMode: "PROVISIONED",
        ProvisionedThroughput: {
          ReadCapacityUnits: 50,
          WriteCapacityUnits: 50
        },
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "S" },
          { AttributeName: "data", AttributeType: "S" }
        ],
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "Overloaded_SK_GSI",
            KeySchema: [
              { AttributeName: "sk", KeyType: "HASH" },
              { AttributeName: "data", KeyType: "RANGE" }
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
          },
          {
            IndexName: "Overloaded_Data_GSI",
            KeySchema: [
              { AttributeName: "data", KeyType: "HASH" },
              { AttributeName: "sk", KeyType: "RANGE" }
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
          }
        ]
      })
    );

    if (TableDescription?.TableStatus !== "ACTIVE") {
      throw new Error("[Jest:GlobalSetup] Failed to initialize test-env DDB-Local table.");
    }

    console.info("[Jest:GlobalSetup] CreateTable operation complete.");
  }
};
