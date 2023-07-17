import { mockClient } from "aws-sdk-client-mock";
import { vi } from "vitest";

vi.mock("@aws-sdk/client-lambda", async () => {
  const {
    LambdaClient: _LambdaClient, // prettier-ignore
    ...otherExports
  } = await vi.importActual<typeof import("@aws-sdk/client-lambda")>("@aws-sdk/client-lambda");

  return {
    ...otherExports,
    LambdaClient: mockClient(new _LambdaClient({})),
  };
});
