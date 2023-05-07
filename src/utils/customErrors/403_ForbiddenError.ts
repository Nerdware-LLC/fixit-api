import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class ForbiddenError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.status = ForbiddenError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlForbiddenError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = ForbiddenError.STATUS_CODE;

  constructor(message = "Forbidden", opts: GraphQLErrorOptions = {}) {
    super(
      message,
      merge(
        {
          extensions: { code: "FORBIDDEN" },
          originalError: new ForbiddenError(message),
        },
        opts
      )
    );

    this.name = "GqlForbiddenError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlForbiddenError);
  }
}
