import { mockClient } from "aws-sdk-client-mock";
import { vi } from "vitest";

vi.mock("@aws-sdk/client-dynamodb", async () => {
  const {
    DynamoDBClient: _DynamoDBClient, // prettier-ignore
    ...otherExports
  } = await vi.importActual<typeof import("@aws-sdk/client-dynamodb")>("@aws-sdk/client-dynamodb");

  return {
    ...otherExports,
    DynamoDBClient: mockClient(new _DynamoDBClient({})),
  };
});
