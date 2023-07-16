import { logger } from "@utils/logger";

Object.entries({
  uncaughtException: 1,
  unhandledRejection: 2,
}).forEach(([errEvent, errExitCode]) => {
  process.on(errEvent, (error) => {
    logger.error(error, `Process Error Event: ${errEvent}`);
    process.exitCode = errExitCode;
  });
});

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signalType) => {
  // eslint-disable-next-line no-process-exit
  process.once(signalType, () => process.exit(process?.exitCode ?? 0));
});

process.on("exit", (exitCode) => {
  if (exitCode === 0) {
    logger.server("Exiting Process [EXIT 0]");
  } else if (exitCode === 1) {
    logger.error("Exiting Process: UNCAUGHT_EXCEPTION [EXIT 1]");
  } else if (exitCode === 2) {
    logger.error("Exiting Process: UNHANDLED_REJECTION [EXIT 2]");
  } else {
    logger.error(`EXITING PROCESS: UNHANDLED ERROR EXIT CODE [EXIT ${exitCode}]`);
  }
});
