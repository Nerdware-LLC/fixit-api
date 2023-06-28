import { GraphQLError, type GraphQLErrorOptions } from "graphql";
import merge from "lodash.merge";
import { ENV } from "@server/env";
import { CustomHttpErrorAbstractClass } from "./CustomHttpErrorAbstractClass";

export class ForbiddenError extends CustomHttpErrorAbstractClass {
  name: string;
  status: number;
  statusCode: number;

  public static readonly STATUS_CODE = 403;
  public static readonly DEFAULT_MSG = "Forbidden";

  constructor(message?: unknown) {
    const messageStr: string =
      typeof message === "string" && message.length > 0 ? message : ForbiddenError.DEFAULT_MSG;

    super(messageStr);
    this.name = "ForbiddenError";
    this.status = ForbiddenError.STATUS_CODE;
    this.statusCode = this.status;
  }
}

export class GqlForbiddenError extends GraphQLError {
  name: string;

  public static readonly STATUS_CODE = ForbiddenError.STATUS_CODE;

  constructor(message?: unknown, opts: GraphQLErrorOptions = {}) {
    const messageStr: string =
      typeof message === "string" && message.length > 0 ? message : ForbiddenError.DEFAULT_MSG;

    super(
      messageStr,
      merge(
        {
          extensions: { code: "FORBIDDEN" },
          originalError: new ForbiddenError(messageStr),
        },
        opts
      )
    );

    this.name = "GqlForbiddenError";

    if (!ENV.IS_PROD) Error.captureStackTrace(this, GqlForbiddenError);
  }
}
