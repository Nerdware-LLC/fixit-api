import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";

process.on("uncaughtException", (error: Error) => {
  logger.error(error, `(Process Event "uncaughtException")`);
});

process.on("unhandledRejection", (rejectionReason: unknown) => {
  const error = getTypeSafeError(rejectionReason);
  logger.error(error, `(Process Event "unhandledRejection")`);
  throw error;
});

process.on("exit", (exitCode) => {
  const loggerFn = exitCode === 0 ? logger.server : logger.error;
  loggerFn(`(Process Event "exit") EXIT_CODE: ${exitCode}`);
});
