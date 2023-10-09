import "@/server/init";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger";
import { expressApp } from "./expressApp";

const server = expressApp.listen(ENV.CONFIG.PORT, () => {
  logger.server("👂 Server is listening.");
});

process.on("exit", () => {
  logger.server("(PROC EXIT) API Server: closing connections ...");
  server.close(() => logger.server("(PROC EXIT) API Server: connections closed."));
});
