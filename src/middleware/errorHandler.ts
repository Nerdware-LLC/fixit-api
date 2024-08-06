import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";
import type { CombineUnionOfObjects } from "@/types/helpers.js";
import type { HttpError } from "@/utils/httpErrors.js";
import type { ErrorRequestHandler } from "express";

const DEFAULT_ERROR_MESSAGE = "An unexpected problem occurred";

/**
 * This function serves as the fallback Express error-handler.
 *
 *   1. Parses the provided error object (`originalError`)
 *
 *   2. Logs pertinent info if the error either
 *      - **(a)** has an http `statusCode` of `5xx`, or
 *      - **(b)** does not have a `statusCode` property
 *
 *   3. Sends a JSON error-response to the client
 *      > _**In prod, `5xx` error messages are masked**_
 */
export const errorHandler: ErrorRequestHandler<
  Record<string, string>,
  unknown,
  Record<string, unknown>
> = (originalError: unknown, req, res, next) => {
  // Parse the originalError param
  const error = getTypeSafeError(originalError, { fallBackErrMsg: DEFAULT_ERROR_MESSAGE });

  const { statusCode: errorStatusCode = 500 } = error as CombineUnionOfObjects<Error | HttpError>;
  let { message: errorMessage } = error;

  if (errorStatusCode >= 500) {
    // Destructure req to get pertinent info
    const { baseUrl, body, headers, ips, method, originalUrl, path } = req;
    logger.error(
      { originalError, req: { baseUrl, body, headers, ips, method, originalUrl, path } },
      `SERVER ERROR on route "${req.originalUrl}"`
    );

    // Mask 5xx error messages in production
    if (ENV.IS_PROD) errorMessage = DEFAULT_ERROR_MESSAGE;
  }

  // If streaming back to the client has already been initiated, use Express's built-in default-error-handler.
  if (res.headersSent) next(originalError);

  // Send JSON response to client
  res.status(errorStatusCode).json({ error: errorMessage });
};
