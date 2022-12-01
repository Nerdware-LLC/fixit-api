import { ENV } from "@server/env";
import { logger } from "@utils/logger";

const {
  IS_PROD,
  NODE_ENV,
  AWS: { REGION },
  CONFIG: { TIMEZONE, OS_PLATFORM, PID, NODE_VERSION, PROJECT_VERSION, API_BASE_URL, PORT, CWD }
} = ENV;

if (!IS_PROD) {
  logger.server(
    `(SERVER STARTUP) 🚀 fixit-api v${PROJECT_VERSION}
    ENV .......... ${NODE_ENV}
    AWS_REGION ... ${REGION}
    Timezone ..... ${TIMEZONE}
    Platform ..... ${OS_PLATFORM}
    PID .......... ${PID}
    NodeJS ....... ${NODE_VERSION}
    URL .......... ${API_BASE_URL}:${PORT}
    CWD .......... ${CWD}`
  );
}
