import { ENV } from "@server/env";

/**
 * Abstract class for custom errors with HTTP status codes.
 */
export abstract class CustomHttpErrorAbstractClass extends Error {
  abstract name: string;
  abstract status: number;
  abstract statusCode?: number;

  constructor(message = "An unknown error occurred") {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomHttpErrorAbstractClass.prototype);

    if (!ENV.IS_PROD) Error.captureStackTrace(this, CustomHttpErrorAbstractClass);
  }
}
