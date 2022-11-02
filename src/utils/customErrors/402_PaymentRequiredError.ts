import { GraphQLError } from "graphql";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class PaymentRequiredError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Payment required") {
    super(message);
    this.name = "PaymentRequiredError";
    this.status = 402;
    this.statusCode = this.status;
  }
}

export class GqlPaymentRequiredError extends GraphQLError {
  name: string;

  constructor(message = "Payment required") {
    super(message, {
      extensions: {
        code: "PAYMENT_REQUIRED"
      },
      originalError: new PaymentRequiredError(message)
    });
    this.name = "GqlPaymentRequiredError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlPaymentRequiredError);
  }
}
