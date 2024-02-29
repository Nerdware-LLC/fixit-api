import "@/server/init.js";
import { ENV } from "@/server/env/index.js";
import { logger } from "@/utils/logger.js";
import { expressApp } from "./expressApp.js";

const server = expressApp.listen(ENV.CONFIG.PORT, () => {
  logger.server("👂 Server is listening.");
});

process.on("exit", () => {
  logger.server("(PROC EXIT) API Server: closing connections ...");
  server.close(() => logger.server("(PROC EXIT) API Server: connections closed."));
});
