import { ApolloError } from "apollo-server-express";
import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";
import { getTypeSafeErr } from "./getTypeSafeErr";

export class PaymentRequiredError extends CustomErrorAbstractClass {
  constructor(message = "Payment required") {
    super(message);
    this.name = "PaymentRequiredError";
    this.status = 402;
    this.statusCode = 402;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, PaymentRequiredError);
  }
}

export class ApolloPaymentRequiredError extends ApolloError {
  constructor(additionalProperties?: ErrorLike) {
    super("Payment required", "PAYMENT_REQUIRED", getTypeSafeErr(additionalProperties));
    this.status = 402;
    this.statusCode = 402;

    Object.defineProperty(this, "name", { value: "PaymentRequiredError" });
    if (!ENV.IS_PROD) Error.captureStackTrace(this, ApolloPaymentRequiredError);
  }
}
