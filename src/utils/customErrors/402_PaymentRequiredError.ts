import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class PaymentRequiredError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 402;

  constructor(message = "Payment required") {
    super(message);
    this.name = "PaymentRequiredError";
    this.status = PaymentRequiredError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlPaymentRequiredError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = PaymentRequiredError.STATUS_CODE;

  constructor(message = "Payment required", opts: GraphQLErrorOptions = {}) {
    super(
      message,
      merge(
        {
          extensions: { code: "PAYMENT_REQUIRED" },
          originalError: new PaymentRequiredError(message)
        },
        opts
      )
    );

    this.name = "GqlPaymentRequiredError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlPaymentRequiredError);
  }
}
