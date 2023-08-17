import { lambdaClient } from "./lambdaClient";

vi.mock("@aws-sdk/lib-dynamodb"); // See <repo_root>/__mocks__/@aws-sdk/lib-dynamodb.ts

const MOCK_PAYLOAD = { test: "payload" };

describe("lib/lambdaClient", () => {
  test("returns expected result from invokeEvent() when given valid input", async () => {
    const result = await lambdaClient.invokeEvent("test-function", MOCK_PAYLOAD);
    expect(result.Payload).toEqual(MOCK_PAYLOAD);
  });

  test("returns expected result from invokeRequestResponse() when given valid input", async () => {
    const result = await lambdaClient.invokeRequestResponse("test-function", MOCK_PAYLOAD);
    expect(result.Payload).toEqual(MOCK_PAYLOAD);
  });
});
