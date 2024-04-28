import { mockClient } from "aws-sdk-client-mock";

const { PinpointClient: _PinpointClient, SendMessagesCommand } = await vi.importActual<
  typeof import("@aws-sdk/client-pinpoint")
>("@aws-sdk/client-pinpoint");

const PinpointClient = vi.fn(
  () =>
    mockClient(_PinpointClient)
      .on(SendMessagesCommand)
      .callsFake(() => ({})) // return an empty object
);

export { PinpointClient, SendMessagesCommand };
