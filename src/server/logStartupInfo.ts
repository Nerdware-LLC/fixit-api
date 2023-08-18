import { ENV } from "@/server/env";
import { logger } from "@/utils/logger";

const {
  NODE_ENV,
  AWS: { REGION },
  CONFIG: { PROJECT_VERSION, TIMEZONE, OS_PLATFORM, PID, NODE_VERSION, API_BASE_URL, PORT, CWD },
} = ENV;

if (ENV.NODE_ENV === "development") {
  logger.server(
    `(SERVER STARTUP) 🚀 fixit-api ${PROJECT_VERSION}
    App Env ...... ${NODE_ENV}
    AWS Region ... ${REGION}
    Timezone ..... ${TIMEZONE}
    Platform ..... ${OS_PLATFORM}
    PID .......... ${PID}
    NodeJS ....... ${NODE_VERSION}
    Host ......... ${API_BASE_URL}:${PORT}
    CWD .......... ${CWD}`
  );
}
