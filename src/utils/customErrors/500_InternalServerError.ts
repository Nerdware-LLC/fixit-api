import { ApolloError } from "apollo-server-express";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class InternalServerError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "An unexpected error occurred") {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
    this.statusCode = this.status;
  }
}

export class ApolloInternalServerError extends ApolloError {
  name: string;

  constructor(additionalProperties?: Record<string, any>) {
    super("An unexpected error occurred", "INTERNAL_SERVER_ERROR", additionalProperties);
    this.name = "InternalServerError";
    this.status = 500;
    this.statusCode = this.status;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, ApolloInternalServerError);
  }
}
