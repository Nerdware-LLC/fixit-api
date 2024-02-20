import { getTypeSafeError, safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { ENV } from "@/server/env";
import { InternalServerError } from "@/utils/httpErrors";
import { logger } from "@/utils/logger";
import type { HttpErrorInterface } from "@/utils/httpErrors";
import type { ErrorRequestHandler } from "express";

/**
 * This is the default error-handling middleware which captures errors and sends a
 * JSON response to the client.
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
  const error = getTypeSafeError(err, { ErrorClass: InternalServerError });

  const errorStatusCode = (error as HttpErrorInterface)?.statusCode || 500;

  if (errorStatusCode >= 500) {
    logger.error(`[SERVER ERROR] On route "${req.originalUrl}": ${safeJsonStringify(err)}`);
  }

  // If streaming back to the client has already been initiated, just delegate to the default built-in error handler.
  if (res.headersSent) return next(err);

  // Send JSON response to client
  res.status(errorStatusCode).json({
    error:
      errorStatusCode >= 500 && ENV.IS_PROD // mask 5xx error messages in production
        ? MASKED_ERROR_MESSAGE
        : error.message || MASKED_ERROR_MESSAGE,
  });
};

const MASKED_ERROR_MESSAGE = "An unexpected error occurred";
