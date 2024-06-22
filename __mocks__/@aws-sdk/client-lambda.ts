import { mockClient } from "aws-sdk-client-mock";

const { LambdaClient: Actual_LambdaClient, InvokeCommand } =
  await vi.importActual<typeof import("@aws-sdk/client-lambda")>("@aws-sdk/client-lambda");

const LambdaClient = vi.fn(() =>
  mockClient(Actual_LambdaClient)
    .on(InvokeCommand)
    .callsFake(({ Payload }) => Promise.resolve({ Payload }))
);

export { LambdaClient, InvokeCommand };
