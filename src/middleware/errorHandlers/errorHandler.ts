import { ENV } from "@server/env";
import { logger } from "@utils/logger";
import type { ErrorRequestHandler } from "express";

const { IS_PROD } = ENV;

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const errStatusCode = err.status || err.statusCode || 500;

  // LOG SERVER ERRORS, NOT 4xx CLIENT ERRORS
  if (errStatusCode >= 500) {
    logger.error(
      `[SERVER ERROR] On route "${req.originalUrl}": ${err.message} \n\n ${err.stack}`,
      "MW:errorHandler"
    );
  }
  // If streaming back to the client has already been initiated, just delegate to the default built-in error handler.
  if (res.headersSent) return next(err);

  // prettier-ignore
  const errMsg = errStatusCode >= 500 && IS_PROD ? "Something failed." : err.message;

  res.status(errStatusCode).json({
    error: errMsg,
  });
};
