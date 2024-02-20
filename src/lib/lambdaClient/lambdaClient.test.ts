import { lambdaClient } from "./lambdaClient";

const MOCK_PAYLOAD = { test: "payload" };

describe("lib/lambdaClient", () => {
  test("returns expected result from invokeEvent() when given valid input", async () => {
    const result = await lambdaClient.invokeEvent("test-function", MOCK_PAYLOAD);
    expect(result.Payload).toStrictEqual(MOCK_PAYLOAD);
  });

  test("returns expected result from invokeRequestResponse() when given valid input", async () => {
    const result = await lambdaClient.invokeRequestResponse("test-function", MOCK_PAYLOAD);
    expect(result.Payload).toStrictEqual(MOCK_PAYLOAD);
  });
});
