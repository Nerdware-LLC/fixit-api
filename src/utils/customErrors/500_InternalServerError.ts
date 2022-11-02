import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
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

export class GqlInternalServerError extends GraphQLError {
  name: string;

  constructor(message = "An unexpected error occurred") {
    super(message, {
      extensions: {
        code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR
      },
      originalError: new InternalServerError(message)
    });
    this.name = "InternalServerError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlInternalServerError);
  }
}
