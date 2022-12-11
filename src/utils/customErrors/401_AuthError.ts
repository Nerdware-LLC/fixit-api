import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class AuthError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
    this.status = AuthError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlAuthError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = AuthError.STATUS_CODE;

  constructor(message = "Authentication required", opts: GraphQLErrorOptions = {}) {
    super(
      message,
      merge(
        {
          extensions: { code: "AUTHENTICATION_REQUIRED" },
          originalError: new AuthError(message)
        },
        opts
      )
    );

    this.name = "GqlAuthError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlAuthError);
  }
}
