import { ENV } from "@server/env";
import { logger, getTypeSafeError, safeJsonStringify } from "@utils";
import type { ErrorRequestHandler } from "express";

/**
 * This is the default error-handling middleware which captures errors and sends a
 * JSON response to the client.
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
  const { statusCode: errorStatusCode = 500, ...error } = getTypeSafeError(err);

  // LOG SERVER ERRORS, NOT 4xx CLIENT ERRORS
  if (errorStatusCode >= 500) {
    logger.error(`[SERVER ERROR] On route "${req.originalUrl}": ${safeJsonStringify(err)}`);
  }

  // If streaming back to the client has already been initiated, just delegate to the default built-in error handler.
  if (res.headersSent) return next(err);

  // Send JSON response to client; mask 500 error-messages in production
  res.status(errorStatusCode).json({
    error: errorStatusCode >= 500 && ENV.IS_PROD ? "An unexpected error occurred" : error.message,
  });
};
