import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";

export class AuthError extends CustomErrorAbstractClass {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
    this.status = 401;
    this.statusCode = 401;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, AuthError);
  }
}
