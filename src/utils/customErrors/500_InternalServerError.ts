import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class InternalServerError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 500;

  constructor(message = "An unexpected error occurred") {
    super(message);
    this.name = "InternalServerError";
    this.status = InternalServerError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlInternalServerError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = InternalServerError.STATUS_CODE;

  constructor(message = "An unexpected error occurred", opts: GraphQLErrorOptions = {}) {
    super(
      message,
      merge(
        {
          extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
          originalError: new InternalServerError(message)
        },
        opts
      )
    );

    this.name = "GqlInternalServerError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlInternalServerError);
  }
}
