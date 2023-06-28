import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class InternalServerError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 500;
  public static readonly DEFAULT_MSG = "An unexpected error occurred";

  constructor(message?: unknown) {
    const messageStr: string =
      typeof message === "string" && message.length > 0 ? message : InternalServerError.DEFAULT_MSG;

    super(messageStr);
    this.name = "InternalServerError";
    this.status = InternalServerError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlInternalServerError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = InternalServerError.STATUS_CODE;

  constructor(message?: unknown, opts: GraphQLErrorOptions = {}) {
    const messageStr: string =
      typeof message === "string" && message.length > 0 ? message : InternalServerError.DEFAULT_MSG;

    super(
      messageStr,
      merge(
        {
          extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
          originalError: new InternalServerError(messageStr),
        },
        opts
      )
    );

    this.name = "GqlInternalServerError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlInternalServerError);
  }
}
