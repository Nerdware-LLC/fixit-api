import { LambdaClient, InvokeCommand, type InvokeCommandInput } from "@aws-sdk/client-lambda";
import { ENV } from "@server/env";

const _lambdaClient = new LambdaClient({ region: ENV.AWS.REGION });

const _invoke = async ({
  FunctionName,
  InvocationType,
  Payload: payloadToSend
}: InvokeCommandInput) => {
  // rest: { $metadata, ExecutedVersion, StatusCode, FunctionError, LogResult }
  const { Payload: returnedPayload, ...rest } = await _lambdaClient.send(
    new InvokeCommand({
      FunctionName,
      InvocationType,
      Payload: Buffer.from(JSON.stringify(payloadToSend))
    })
  );
  return {
    Payload: returnedPayload ? Buffer.from(returnedPayload).toString() : null,
    ...rest
  };
};

/**
 * Simple interface for invoking Lambda functions.
 * @method `invokeEvent` Invoke Lambda fn using asynchronous "Event" invocation.
 * @method `invokeRequestResponse` Invoke Lambda fn using synchronous "RequestResponse" invocation.
 */
export const lambdaClient = Object.freeze({
  invokeEvent: async (
    lambdaFnName: InvokeCommandInput["FunctionName"],
    lambdaFnPayload: InvokeCommandInput["Payload"]
  ) => _invoke({ FunctionName: lambdaFnName, InvocationType: "Event", Payload: lambdaFnPayload }),
  invokeRequestResponse: async (
    lambdaFnName: InvokeCommandInput["FunctionName"],
    lambdaFnPayload: InvokeCommandInput["Payload"]
  ) =>
    _invoke({
      FunctionName: lambdaFnName,
      InvocationType: "RequestResponse",
      Payload: lambdaFnPayload
    })
});
