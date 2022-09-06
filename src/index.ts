// import "module-alias/register"; // Ensures TS path aliases work from build/
import "@server/init";
import { ENV } from "@server";
import { logger } from "@utils";
import { expressApp } from "./expressApp";

const server = expressApp.listen(ENV.CONFIG.PORT, () => {
  logger.server("👂 Server is listening.");
});

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signalType) => {
  process.once(signalType, () => {
    logger.server(`📢 ${signalType} signal detected. Closing connections ...`);
    server.close(() => logger.server(`(${signalType}) Connections closed.`));
  });
});
