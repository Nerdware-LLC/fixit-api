import { mockClient } from "aws-sdk-client-mock";

const { LambdaClient: _LambdaClient, InvokeCommand } = await vi.importActual<
  typeof import("@aws-sdk/client-lambda")
>("@aws-sdk/client-lambda");

const LambdaClient = vi.fn(() =>
  mockClient(_LambdaClient)
    .on(InvokeCommand)
    .callsFake(({ Payload }) => ({ Payload }))
);

export { LambdaClient, InvokeCommand };
