import { ApolloError } from "apollo-server-express";
import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";

export class InternalServerError extends CustomErrorAbstractClass {
  constructor(message = "An unexpected error occurred") {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
    this.statusCode = 500;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, InternalServerError);
  }
}

export class ApolloInternalServerError extends ApolloError {
  constructor(additionalProperties?: Record<string, any>) {
    super("An unexpected error occurred", "INTERNAL_SERVER_ERROR", additionalProperties);
    this.status = 500;
    this.statusCode = 500;

    Object.defineProperty(this, "name", { value: "InternalServerError" });
    if (!ENV.IS_PROD) Error.captureStackTrace(this, ApolloInternalServerError);
  }
}
