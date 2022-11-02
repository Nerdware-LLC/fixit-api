import { GraphQLError } from "graphql";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class ForbiddenError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
    this.statusCode = this.status;
  }
}

export class GqlForbiddenError extends GraphQLError {
  name: string;

  constructor(message = "Forbidden") {
    super(message, {
      extensions: {
        code: "FORBIDDEN"
      },
      originalError: new ForbiddenError(message)
    });
    this.name = "GqlForbiddenError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlForbiddenError);
  }
}
