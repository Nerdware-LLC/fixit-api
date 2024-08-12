import { mockClient } from "aws-sdk-client-mock";

const { PinpointClient: Actual_PinpointClient, SendMessagesCommand } = await vi.importActual<
  typeof import("@aws-sdk/client-pinpoint")
>("@aws-sdk/client-pinpoint");

const PinpointClient = vi.fn(
  () =>
    mockClient(Actual_PinpointClient)
      .on(SendMessagesCommand)
      .callsFake(() => Promise.resolve({})) // return an empty object
);

export { PinpointClient, SendMessagesCommand };
