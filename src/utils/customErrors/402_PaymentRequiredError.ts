import { ApolloError } from "apollo-server-express";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";
import { getTypeSafeErr } from "./getTypeSafeErr";

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

export class ApolloPaymentRequiredError extends ApolloError {
  name: string;

  constructor(additionalProperties?: ErrorLike) {
    super("Payment required", "PAYMENT_REQUIRED", getTypeSafeErr(additionalProperties));
    this.name = "PaymentRequiredError";
    this.status = 402;
    this.statusCode = this.status;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, ApolloPaymentRequiredError);
  }
}
