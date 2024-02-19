import { getTypeSafeError } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger";

Object.entries({
  uncaughtException: 1,
  unhandledRejection: 2,
}).forEach(([errEvent, errExitCode]) => {
  process.on(errEvent, (error) => {
    logger.error(getTypeSafeError(error));
    process.exitCode = errExitCode;
  });
});

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signalType) => {
  // eslint-disable-next-line no-process-exit
  process.once(signalType, () => process.exit(process?.exitCode ?? 0));
});

process.on("exit", (exitCode) => {
  // If zero, exit normally
  if (exitCode === 0) {
    logger.server("Exiting Process (EXIT_CODE: 0)");
  } else {
    // Else, log the error type
    const errorDescription =
      exitCode === 1
        ? "UNCAUGHT_EXCEPTION"
        : exitCode === 2
          ? "UNHANDLED_REJECTION"
          : "UNHANDLED_ERROR_EXIT_CODE";

    logger.error(`EXITING PROCESS: ${errorDescription} (EXIT_CODE: ${exitCode})`);
  }
});
