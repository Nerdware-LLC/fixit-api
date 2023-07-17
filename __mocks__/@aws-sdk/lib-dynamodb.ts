import { mockClient } from "aws-sdk-client-mock";
import { vi } from "vitest";

vi.mock("@aws-sdk/lib-dynamodb", async () => {
  const {
    DynamoDBDocumentClient: _DynamoDBDocumentClient, // prettier-ignore
    ...otherExports
  } = await vi.importActual<typeof import("@aws-sdk/lib-dynamodb")>("@aws-sdk/lib-dynamodb");

  return {
    ...otherExports,
    DynamoDBDocumentClient: mockClient(_DynamoDBDocumentClient),
  };
});
