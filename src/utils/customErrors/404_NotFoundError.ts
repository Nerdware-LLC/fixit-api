import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";

export class NotFoundError extends CustomErrorAbstractClass {
  constructor(message = "Unable to find the requested resource") {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
    this.statusCode = 404;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, NotFoundError);
  }
}
