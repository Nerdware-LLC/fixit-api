import { GraphQLError } from "graphql";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class AuthError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
    this.status = 401;
    this.statusCode = this.status;
  }
}

export class GqlAuthError extends GraphQLError {
  name: string;

  constructor(message = "Authentication required") {
    super(message, {
      extensions: {
        code: "AUTHENTICATION_REQUIRED"
      },
      originalError: new AuthError(message)
    });
    this.name = "GqlAuthError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlAuthError);
  }
}
