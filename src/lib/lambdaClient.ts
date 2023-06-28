import { LambdaClient, InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { ENV } from "@server/env";
import { safeJsonStringify } from "@utils/typeSafety";
import type { OverrideProperties, Except } from "type-fest";

const _lambdaClient = new LambdaClient({ region: ENV.AWS.REGION });

const _invoke = async ({
  InvocationType,
  FunctionName,
  Payload: payloadToSend,
  ...invokeCmdOpts
}: LambdaClientInvokeOpts) => {
  const { Payload: returnedPayload, ...rest } = await _lambdaClient.send(
    new InvokeCommand({
      InvocationType,
      FunctionName,
      Payload: Buffer.from(safeJsonStringify(payloadToSend)),
      ...invokeCmdOpts,
    })
  );
  return {
    Payload: returnedPayload ? Buffer.from(returnedPayload).toString() : null,
    ...rest, // rest: { $metadata, ExecutedVersion, StatusCode, FunctionError, LogResult }
  };
};

/**
 * Simple interface for invoking Lambda functions.
 * @method `invokeEvent` Invoke Lambda fn using asynchronous "Event" invocation.
 * @method `invokeRequestResponse` Invoke Lambda fn using synchronous "RequestResponse" invocation.
 */
export const lambdaClient: Readonly<
  Record<
    "invokeEvent" | "invokeRequestResponse",
    (
      lambdaFnName: LambdaClientInvokeOpts["FunctionName"],
      lambdaFnPayload: LambdaClientInvokeOpts["Payload"],
      invokeCmdOpts?: Except<InvokeCommandInput, "InvocationType" | "FunctionName" | "Payload">
    ) => ReturnType<typeof _invoke>
  >
> = {
  invokeEvent: async (FunctionName, Payload, invokeOpts = {}) => {
    return _invoke({ InvocationType: "Event", FunctionName, Payload, ...invokeOpts });
  },
  invokeRequestResponse: async (FunctionName, Payload, invokeOpts = {}) => {
    return _invoke({ InvocationType: "RequestResponse", FunctionName, Payload, ...invokeOpts });
  },
} as const;

export type LambdaClientInvokeOpts = OverrideProperties<
  InvokeCommandInput,
  {
    InvocationType: "Event" | "RequestResponse";
    FunctionName: string;
    Payload: unknown;
  }
>;
