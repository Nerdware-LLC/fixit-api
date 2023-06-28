import { ENV } from "@server/env";

/**
 * Abstract class for custom errors with HTTP status codes.
 */
export abstract class CustomHttpErrorAbstractClass extends Error {
  abstract name: string;
  abstract status: number;
  abstract statusCode?: number;

  constructor(message?: unknown) {
    super(
      typeof message === "string" && message.length > 0 ? message : "An unknown error occurred"
    );

    // Explicitly set the prototype
    Object.setPrototypeOf(this, CustomHttpErrorAbstractClass.prototype);

    if (!ENV.IS_PROD) Error.captureStackTrace(this, CustomHttpErrorAbstractClass);
  }
}
