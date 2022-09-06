import { ENV } from "@server/env";
import { CustomErrorAbstractClass } from "./CustomErrorAbstractClass";

export class ClientInputError extends CustomErrorAbstractClass {
  constructor(message = "Invalid client input") {
    super(message);
    this.name = "ClientInputError";
    this.status = 400;
    this.statusCode = 400;
    this.message = message;

    if (!ENV.IS_PROD) Error.captureStackTrace(this, ClientInputError);
  }
}
