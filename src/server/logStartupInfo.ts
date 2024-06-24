import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";

const {
  NODE_ENV,
  AWS,
  CONFIG: { PROJECT_VERSION, TIMEZONE, OS_PLATFORM, PID, NODE_VERSION, API_BASE_URL, PORT, CWD },
} = ENV;

if (ENV.IS_DEV) {
  logger.server(
    `(SERVER STARTUP) 🚀 fixit-api ${PROJECT_VERSION || ""}
    NODE_ENV...... ${NODE_ENV}
    AWS Region ... ${AWS.REGION}
    Timezone ..... ${TIMEZONE}
    Platform ..... ${OS_PLATFORM}
    PID .......... ${PID}
    NodeJS ....... ${NODE_VERSION}
    Host ......... ${API_BASE_URL}:${PORT}
    CWD .......... ${CWD}`
  );
}
