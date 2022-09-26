import "module-alias/register"; // Ensures TS path aliases work from build/
import "@server/init";
import { ENV } from "@server";
import { logger } from "@utils";
import { expressApp } from "./expressApp";

const server = expressApp.listen(ENV.CONFIG.PORT, () => {
  logger.server("👂 Server is listening.");
});

process.on("exit", () => {
  logger.server("(PROC EXIT) API Server: closing connections ...");
  server.close(() => logger.server("(PROC EXIT) API Server: connections closed."));
});
