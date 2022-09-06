import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";

export class ForbiddenError extends CustomErrorAbstractClass {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
    this.statusCode = 403;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, ForbiddenError);
  }
}
