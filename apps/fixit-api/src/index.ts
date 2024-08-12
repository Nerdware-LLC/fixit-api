import "@/server/init.js";
import { httpServer } from "@/httpServer.js";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";

await httpServer.start({ port: ENV.CONFIG.PORT }, () => {
  logger.server("👂 Server is listening.");
});
